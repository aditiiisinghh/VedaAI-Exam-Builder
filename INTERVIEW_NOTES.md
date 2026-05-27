# Interview Notes

## One-Minute Explanation

This is an AI assessment creator for teachers. The frontend collects the assignment details and question blueprint, the backend stores the assignment, pushes generation into a BullMQ queue, and a worker creates a structured paper. The frontend listens over WebSocket and updates the paper view when generation completes.

## Why Queue?

AI generation and PDF-style processing can take time. If we do it directly inside the API request, the request can timeout and the user gets a poor experience. BullMQ lets the API respond quickly while the worker handles long-running generation reliably.

## Why WebSocket?

The assignment asks for real-time updates. WebSocket avoids polling and lets the UI show `queued`, `generating`, `completed`, or `failed` status immediately.

## Why Not Render Raw AI Output?

The model response is parsed into a known object shape:

- sections
- questions
- difficulty
- marks
- answer key

That makes the output reliable, printable, searchable, and easier to validate.

## If They Ask About AI Reliability

I would mention:

- prompt asks for strict JSON
- backend normalizes missing IDs/labels
- real projects should add schema validation on generated output
- retry/failure is handled by BullMQ attempts
- mock fallback exists only for local review without API keys

## If They Ask What You Would Improve

- Add authentication for teacher accounts.
- Add school/class entities instead of text fields.
- Add generated-output schema validation with Zod.
- Store PDFs in object storage.
- Add streaming job logs and better retry controls.
- Add tests around prompt generation and route validation.
