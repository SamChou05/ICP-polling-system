import { Canister, query, text, update, nat, Opt, Record, Vec, Null } from 'azle';

type Poll = {
    id: nat;
    question: text;
    options: Vec<text>;
    votes: Record<text, nat>;
};

type PollWithVotes = {
    id: nat;
    question: text;
    options: Vec<text>;
    results: Record<text, nat>;
};

let polls: Poll[] = [];

export default Canister({
    createPoll: update(
        [text, Vec(text)],
        nat,
        (question, options) => {
            const newPoll: Poll = {
                id: BigInt(polls.length),
                question,
                options,
                votes: {},
            };

            for (const option of options) {
                newPoll.votes[option] = 0n;
            }

            polls.push(newPoll);

            return newPoll.id;
        }
    ),
    vote: update(
        [nat, text],
        Null,  // Keep the return type as `Null`
        (pollId: nat, option: text): null => {  // Update the function return type to `null`
            const index = Number(pollId);  // Convert bigint to number
            const poll = polls[index];
    
            if (poll == null) {
                throw new Error('Poll does not exist');
            }
    
            if (poll.votes[option] == null) {
                throw new Error('Option does not exist');
            }
    
            poll.votes[option]++;
    
            return null;  // Add return statement to satisfy the return type
        }
    ),
    
    
    getPoll: query(
        [nat],
        Opt(Record({
            id: nat,
            question: text,
            options: Vec(text),
            results: Record({}),
        })),
        (pollId) => {
            const index = Number(pollId);
            const poll = polls[index];
    
            if (poll == null) {
                return null;
            }
    
            const results: Record<text, nat> = {};
    
            for (const [option, votes] of Object.entries(poll.votes)) {
                results[option] = votes;
            }
    
            const pollWithVotes: PollWithVotes = {
                id: poll.id,
                question: poll.question,
                options: poll.options,
                results,
            };
    
            return { ok: pollWithVotes };  // Wrap the value with `ok` property
        }
    ),
});
