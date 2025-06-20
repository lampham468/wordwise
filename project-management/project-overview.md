I want to generate a web app like Grammarly to help people write better. The intended user are people who want to draft messages for networking. The suggestions should help the user write more engaging messages that gets replies by tapping into relevant information.

You are a technical product manager helping to design the next million-dollar web app, taking inspiration from Grammarly. The core of the app is a text editor that gives writing suggestions as the user types.

## THE USER
Anyone looking the write engaging messages that attract attention, mainly for networking, but could be for sales as well. The product we are selling is text—enhanced text—and a seamless, responsive UX to help the user expedite the writing process.

## THE PRODUCT AND THE COMPETITION
The product we are selling is text—enhanced text—and a seamless, responsive UX to help the user expedite the writing process.

The competition is advanced LLMs (large language models), to which you can provide context and simply prompt for a message. However, LLM are trained from the voice of millions, and we want to help the user develop their own consistent voice. Furthermore, the LLM writing cycle does not support speedy iteration: you have to prompt, wait, re-prompt, and that can take a long time to end up with a message you like. We aim to deliver good suggestions that spark ideas quickly, as well as handle the boring stuff such as grammar and spelling.

## REQUIREMENTS
The web app has an editor that the user uses to type messages. As the user types, suggestions appear seamlessly, in a way that is helpful and inspirational, but not distracting.

The suggestions should come in multiple flavors:
1. Spelling and grammar checks. This should be context aware; for example in "Their are many cats", the word "Their" should be flagged even though technically it's spelled right, because it should be "There".
2. Clarity and engagement suggestion using lightweight LLM. For example, tell the user they're using the passive tone, which is not great. This should include recommendation of literary and rhetorical devices to enhance the writing.
3. Advanced suggestions on what to write based on relevant contexts. For examples, facts about the user, facts about the intended audience, or the news can be prepared by the user and included with the user's current writing to feed to an advanced LLM for improved suggestions.

The user should also be able to save documents and reference them as context in another document. This is how context is provided in item 3 above.

## DEVELOPMENT PROCESS
Should be done in two phases:

### Phase 1: Core Clone

Develop a complete writing assistant with the following essential features:
- Real-time grammar and spell checking
- Basic style suggestions and readability analysis
- Clean, responsive text editor interface
- User authentication and document management
- Core functionality matching Grammarly’s base experience (spell checking and grammar checking, the rest requires LLM and can be added in Phase 2)

### Phase 2: Advanced Features
- Context-aware suggestions powered by LLMs
- Personalized writing recommendations based on given context (facts about the target audience, the news, facts about the writer, etc.)
- Advanced style analysis beyond rule-based corrections
- Intelligent content generation and improvement suggestions
- Learn user's writing voice and tailor suggestions to their style.

## ULTIMATE GOAL
Deliver a next-generation writing assistant surpassing the capabilities of traditional LLM prompting.
