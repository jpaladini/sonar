"""Deterministic v1 chat routing.

Routes a user query to canned assistant blocks by keyword, mirroring the
prototype's seeded answers. The block schema is the production contract — v2
swaps this router for a serving-endpoint call with tool-calling over the data
layer, emitting the exact same shapes.
"""

from __future__ import annotations

from typing import Any

from . import fixtures


def route(query: str) -> list[dict[str, Any]]:
    q = query.lower()

    if "driver" in q and "escalation" not in q:
        return [
            fixtures.text_block(
                "Last week (Jul 20–26) the pipeline processed 1,198 calls. Five "
                "drivers accounted for 87% of volume:"),
            fixtures.deepcopy(fixtures.DRIVERS_BARS),
            fixtures.text_block(
                "Billing disputes are up 22% vs. the prior week — concentrated on "
                "Jul 20–21, right after the Jul 18 invoice cycle."),
        ]

    if "sentiment" in q and ("categor" in q or "low" in q) and "agent" not in q:
        return [
            fixtures.text_block("Two categories sit below the 3.2 team average:"),
            fixtures.deepcopy(fixtures.SENTIMENT_TABLE),
            fixtures.text_block(
                "Cancellations is the clear outlier — down 0.4 week-over-week. "
                "Outage sentiment tracks the Jul 21 incident and should recover."),
        ]

    if "agent" in q:
        return [
            fixtures.text_block(
                "4 retention agents fall well below the 2.9 team average on "
                "cancellation-labeled calls:"),
            fixtures.deepcopy(fixtures.AGENTS_BLOCK),
            fixtures.text_block(
                "Marcus and Dana sit 0.9+ below average. Select an agent to open "
                "the full scorecard in the side panel."),
        ]

    if "transcript" in q or "call bodies" in q or ("pull" in q and "call" in q):
        return [
            fixtures.text_block(
                "Found 23 cancellation calls for Marcus Webb, Jul 20–26. I loaded "
                "the 3 lowest-sentiment transcripts into the panel →"),
            fixtures.deepcopy(fixtures.CHIPS_BLOCK),
            fixtures.text_block(
                "Common pattern across all three: the retention offer is read "
                "verbatim after the customer states firm cancel intent, and the "
                "labeler flags \"customer repeats request\" in each."),
        ]

    if "escalation" in q:
        return [
            fixtures.text_block(
                "Escalation rate has climbed 4.9 points over the trailing 30 days, "
                "with the sharpest jump in W30 — driven almost entirely by the "
                "cancellation queue:"),
            fixtures.deepcopy(fixtures.ESCALATION_BARS),
            fixtures.text_block(
                "W30's 14.0% is the highest 4-week reading this quarter. The "
                "labeler attributes 71% of new escalations to supervisor-transfer "
                "requests on cancellation calls."),
        ]

    return [
        fixtures.text_block(fixtures.DEFAULT_TEXT),
        fixtures.deepcopy(fixtures.DEFAULT_BARS),
    ]
