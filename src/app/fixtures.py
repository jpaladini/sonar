"""Canned data for Sonar, mirroring the design prototype seed exactly.

Every payload shape here is the contract the frontend renders. Colors are
semantic tokens ("good" | "warn" | "bad" | "text" | "muted" | "faint") that the
SPA maps onto CSS variables; the BFF never emits CSS.
"""

from __future__ import annotations

import copy
from typing import Any

# ---------------------------------------------------------------- chat blocks


def text_block(text: str) -> dict[str, Any]:
    return {"isText": True, "text": text}


DRIVERS_BARS = {
    "isBars": True,
    "title": "Call drivers · Jul 20–26",
    "items": [
        {"label": "Billing disputes", "value": "412 · 34%", "pct": "100%"},
        {"label": "Service outages", "value": "288 · 24%", "pct": "70%"},
        {"label": "Plan changes", "value": "201 · 17%", "pct": "49%"},
        {"label": "Cancellations", "value": "164 · 14%", "pct": "40%"},
        {"label": "Tech support", "value": "133 · 11%", "pct": "32%"},
    ],
}

SENTIMENT_TABLE = {
    "isTable": True,
    "cols": "1.3fr .9fr .8fr .7fr",
    "headers": ["Category", "Avg sentiment", "Δ WoW", "Flag"],
    "rows": [
        {"cells": [
            {"text": "Cancellations", "mono": False, "color": "text", "weight": 500},
            {"text": "2.1 / 5", "mono": True, "color": "bad", "weight": 600},
            {"text": "−0.4", "mono": True, "color": "bad", "weight": 400},
            {"text": "LOW", "mono": True, "color": "bad", "weight": 600},
        ]},
        {"cells": [
            {"text": "Service outages", "mono": False, "color": "text", "weight": 500},
            {"text": "2.6 / 5", "mono": True, "color": "warn", "weight": 600},
            {"text": "−0.1", "mono": True, "color": "muted", "weight": 400},
            {"text": "WATCH", "mono": True, "color": "warn", "weight": 600},
        ]},
        {"cells": [
            {"text": "Billing disputes", "mono": False, "color": "text", "weight": 500},
            {"text": "3.1 / 5", "mono": True, "color": "muted", "weight": 400},
            {"text": "+0.2", "mono": True, "color": "good", "weight": 400},
            {"text": "—", "mono": True, "color": "faint", "weight": 400},
        ]},
        {"cells": [
            {"text": "Tech support", "mono": False, "color": "text", "weight": 500},
            {"text": "3.5 / 5", "mono": True, "color": "muted", "weight": 400},
            {"text": "+0.1", "mono": True, "color": "good", "weight": 400},
            {"text": "—", "mono": True, "color": "faint", "weight": 400},
        ]},
        {"cells": [
            {"text": "Plan changes", "mono": False, "color": "text", "weight": 500},
            {"text": "3.8 / 5", "mono": True, "color": "muted", "weight": 400},
            {"text": "0.0", "mono": True, "color": "faint", "weight": 400},
            {"text": "—", "mono": True, "color": "faint", "weight": 400},
        ]},
    ],
}

AGENTS_BLOCK = {
    "isAgents": True,
    "items": [
        {"name": "Marcus Webb", "initials": "MW", "team": "Retention · Tier 2",
         "score": "1.8", "scoreColor": "bad", "calls": 23, "tab": "data"},
        {"name": "Dana Ruiz", "initials": "DR", "team": "Retention · Tier 2",
         "score": "2.0", "scoreColor": "bad", "calls": 17, "tab": "data"},
        {"name": "Priya Nair", "initials": "PN", "team": "Retention · Tier 1",
         "score": "2.2", "scoreColor": "warn", "calls": 31, "tab": "data"},
        {"name": "Tom Okafor", "initials": "TO", "team": "Retention · Tier 1",
         "score": "2.3", "scoreColor": "warn", "calls": 12, "tab": "data"},
    ],
}

CHIPS_BLOCK = {
    "isChips": True,
    "items": [
        {"label": "CALL-88214", "sub": "Mon 10:42 · 1.2", "tab": "transcripts"},
        {"label": "CALL-88317", "sub": "Tue 14:05 · 1.5", "tab": "transcripts"},
        {"label": "CALL-88423", "sub": "Thu 09:18 · 1.7", "tab": "transcripts"},
    ],
}

ESCALATION_BARS = {
    "isBars": True,
    "title": "Escalation rate · trailing 30 days",
    "items": [
        {"label": "W27", "value": "9.1%", "pct": "65%"},
        {"label": "W28", "value": "9.8%", "pct": "70%"},
        {"label": "W29", "value": "11.6%", "pct": "83%"},
        {"label": "W30", "value": "14.0%", "pct": "100%"},
    ],
}

DEFAULT_BARS = {
    "isBars": True,
    "title": "Relevant slice · current window",
    "items": [
        {"label": "Matching calls", "value": "164", "pct": "100%"},
        {"label": "Below 3.0 sent.", "value": "61 · 37%", "pct": "37%"},
        {"label": "Escalated", "value": "19 · 12%", "pct": "12%"},
    ],
}

DEFAULT_TEXT = (
    "Here’s what I found in the labeled data. Across the current 7-day window "
    "the pattern holds: volume concentrates early-week, and sentiment dips "
    "track the cancellation queue rather than any single agent shift. I’ve "
    "summarized the relevant slice below — open the side panel for the full "
    "breakdown."
)

# ------------------------------------------------------- seeded conversations

_C1_MESSAGES = [
    {"isUser": True, "text": "What were the primary call drivers last week?"},
    {"isAssistant": True, "blocks": [
        text_block("Last week (Jul 20–26) the pipeline processed 1,198 calls. "
                   "Five drivers accounted for 87% of volume:"),
        DRIVERS_BARS,
        text_block("Billing disputes are up 22% vs. the prior week — concentrated "
                   "on Jul 20–21, right after the Jul 18 invoice cycle."),
    ]},
    {"isUser": True, "text": "Was sentiment low in any of those categories?"},
    {"isAssistant": True, "blocks": [
        text_block("Two categories sit below the 3.2 team average:"),
        SENTIMENT_TABLE,
        text_block("Cancellations is the clear outlier — down 0.4 week-over-week. "
                   "Outage sentiment tracks the Jul 21 incident and should recover."),
    ]},
    {"isUser": True, "text": "Which agents had the lowest sentiment on cancellation calls?"},
    {"isAssistant": True, "blocks": [
        text_block("4 retention agents fall well below the 2.9 team average on "
                   "cancellation-labeled calls:"),
        AGENTS_BLOCK,
        text_block("Marcus and Dana sit 0.9+ below average. Select an agent to open "
                   "the full scorecard in the side panel."),
    ]},
    {"isUser": True, "text": "Pull the call bodies for Marcus Webb this week."},
    {"isAssistant": True, "blocks": [
        text_block("Found 23 cancellation calls for Marcus Webb, Jul 20–26. I loaded "
                   "the 3 lowest-sentiment transcripts into the panel →"),
        CHIPS_BLOCK,
        text_block("Common pattern across all three: the retention offer is read "
                   "verbatim after the customer states firm cancel intent, and the "
                   "labeler flags \"customer repeats request\" in each."),
    ]},
]

_C2_MESSAGES = [
    {"isUser": True, "text": "Show QA outliers on refund calls yesterday."},
    {"isAssistant": True, "blocks": [
        text_block("12 refund calls scored ≥2 QA deviations yesterday. Biggest "
                   "cluster: missing disclosure statement (7 calls, 4 agents, all on "
                   "the new refund script v3). Want the agent list or the script diff?"),
    ]},
]

_C3_MESSAGES = [
    {"isUser": True, "text": "Build a coaching list from last week’s low-sentiment calls."},
    {"isAssistant": True, "blocks": [
        text_block("Drafted a coaching list: 6 agents, 14 flagged calls, grouped by "
                   "pattern (offer timing ×3, hold handling ×2, tone ×1). Saved to "
                   "the library — open the Saved tab to review."),
    ]},
]

SEED_CONVERSATIONS: dict[str, dict[str, Any]] = {
    "c1": {"title": "Call drivers & sentiment — W30", "sub": "drivers · sentiment · Webb",
           "when": "today", "pinned": False, "messages": _C1_MESSAGES},
    "c2": {"title": "QA outliers — refunds", "sub": "refund script v3 disclosures",
           "when": "yesterday", "pinned": False, "messages": _C2_MESSAGES},
    "c3": {"title": "Agent coaching list", "sub": "6 agents · 14 calls",
           "when": "yesterday", "pinned": False, "messages": _C3_MESSAGES},
    "p1": {"title": "Weekly driver report", "sub": "recurring · Mondays 9am",
           "when": "pinned", "pinned": True, "messages": []},
    "p2": {"title": "Cancellation deep-dive", "sub": "sentiment root causes",
           "when": "pinned", "pinned": True, "messages": []},
    "w1": {"title": "Outage surge postmortem", "sub": "Jul 21 incident calls",
           "when": "week", "pinned": False, "messages": []},
    "w2": {"title": "New-hire ramp check", "sub": "cohort C sentiment trend",
           "when": "week", "pinned": False, "messages": []},
}

SEED_ACTIVE_ID = "c1"

# ------------------------------------------------------------------- panels

REPORT = {
    "kicker": "SONAR-RPT · generated from this conversation",
    "title": "Weekly Call Driver Report",
    "meta": "Jul 20 – 26 · 1,198 calls · CX Operations",
    "summary": [
        {"text": "Billing disputes led volume at 34% (+22% WoW), tied to the "
                 "Jul 18 invoice cycle. Sentiment held steady overall (3.2 avg) "
                 "with one exception: ", "bold": False},
        {"text": "cancellation calls fell to 2.1", "bold": True},
        {"text": ", down 0.4 week-over-week.", "bold": False},
    ],
    "findings": [
        "4 retention agents sit ≥0.6 below the 2.9 team sentiment average.",
        "Lowest-scoring calls share a pattern: scripted retention offers "
        "delivered after firm cancel intent.",
        "Service-outage sentiment (2.6) is expected to recover as the Jul 21 "
        "incident ages out.",
    ],
    "actions": [
        "Coach retention Tier 2 on offer timing (Webb, Ruiz priority).",
        "Flag invoice-cycle billing spikes to WFM for staffing.",
        "Re-run cancellation sentiment after coaching, W32.",
    ],
}

CHARTS = {
    "volume": {
        "title": "Call volume by day",
        "items": [
            {"day": "Mon", "pct": 62, "muted": False},
            {"day": "Tue", "pct": 88, "muted": False},
            {"day": "Wed", "pct": 74, "muted": False},
            {"day": "Thu", "pct": 67, "muted": False},
            {"day": "Fri", "pct": 79, "muted": False},
            {"day": "Sat", "pct": 34, "muted": True},
            {"day": "Sun", "pct": 22, "muted": True},
        ],
    },
    "sentiment": {
        "title": "Sentiment by category",
        "items": [
            {"label": "Plan changes", "value": "3.8", "pct": "76%", "color": "good"},
            {"label": "Tech support", "value": "3.5", "pct": "70%", "color": "good"},
            {"label": "Billing", "value": "3.1", "pct": "62%", "color": "text"},
            {"label": "Outages", "value": "2.6", "pct": "52%", "color": "warn"},
            {"label": "Cancellations", "value": "2.1", "pct": "42%", "color": "bad"},
        ],
        "footnote": "Scale 1–5, scored per call by the labeling model. Team average 3.2.",
    },
    "driverDelta": {
        "title": "Driver mix WoW",
        "items": [
            {"label": "Billing disputes", "share": "34%", "delta": "+22%", "color": "bad"},
            {"label": "Service outages", "share": "24%", "delta": "+9%", "color": "warn"},
            {"label": "Plan changes", "share": "17%", "delta": "−2%", "color": "muted"},
            {"label": "Cancellations", "share": "14%", "delta": "+4%", "color": "muted"},
            {"label": "Tech support", "share": "11%", "delta": "−6%", "color": "good"},
        ],
    },
}

TRANSCRIPTS = {
    "header": "Marcus Webb — lowest sentiment",
    "counter": "3 of 23 calls",
    "items": [
        {
            "id": "CALL-88214", "meta": "Mon 10:42 · 11m 04s", "score": "1.2",
            "labels": ["Cancellation", "Repeat request", "Offer after intent"],
            "turns": [
                {"who": "CUST", "agent": False,
                 "text": "I’d like to cancel my service, effective today please."},
                {"who": "WEBB", "agent": True,
                 "text": "Before we do that, I’m required to share that we have a "
                         "fantastic loyalty offer — 20% off for 12 months plus a free…"},
                {"who": "CUST", "agent": False,
                 "text": "I’ve already decided. I just want to cancel. This is the "
                         "third time I’m asking."},
                {"who": "WEBB", "agent": True,
                 "text": "I understand, but let me just finish walking you through "
                         "the offer details, because I think you’ll find—"},
                {"who": "CUST", "agent": False,
                 "text": "Please just process the cancellation. Or transfer me to "
                         "someone who will."},
            ],
        },
        {
            "id": "CALL-88317", "meta": "Tue 14:05 · 8m 41s", "score": "1.5",
            "labels": ["Cancellation", "Hold > 3 min", "Offer after intent"],
            "turns": [
                {"who": "CUST", "agent": False,
                 "text": "Hi, I’m calling to cancel before my renewal on Friday."},
                {"who": "WEBB", "agent": True,
                 "text": "Let me place you on a brief hold while I pull up retention "
                         "options."},
                {"who": "CUST", "agent": False,
                 "text": "(after 4m 12s hold) Hello? I didn’t ask for options, I "
                         "asked to cancel."},
            ],
        },
        {
            "id": "CALL-88423", "meta": "Thu 09:18 · 6m 22s", "score": "1.7",
            "labels": ["Cancellation", "Talk-over", "Script deviation"],
            "turns": [
                {"who": "CUST", "agent": False,
                 "text": "I’m moving somewhere you don’t have coverage, so I need to "
                         "cancel."},
                {"who": "WEBB", "agent": True,
                 "text": "Have you checked our coverage map recently? We’ve expanded "
                         "quite a bit—"},
                {"who": "CUST", "agent": False,
                 "text": "Yes. You don’t cover it. I checked before calling."},
            ],
        },
    ],
}

AGENTS_TABLE = {
    "title": "Retention agents — W30",
    "sort": "sorted by sentiment ↑",
    "rows": [
        {"name": "Marcus Webb", "sent": "1.8", "calls": 23, "esc": "26%", "color": "bad"},
        {"name": "Dana Ruiz", "sent": "2.0", "calls": 17, "esc": "18%", "color": "bad"},
        {"name": "Priya Nair", "sent": "2.2", "calls": 31, "esc": "13%", "color": "warn"},
        {"name": "Tom Okafor", "sent": "2.3", "calls": 12, "esc": "17%", "color": "warn"},
        {"name": "Lena Park", "sent": "2.9", "calls": 26, "esc": "8%", "color": "text"},
        {"name": "Sam Adeyemi", "sent": "3.1", "calls": 19, "esc": "6%", "color": "text"},
        {"name": "Rosa Delgado", "sent": "3.4", "calls": 22, "esc": "5%", "color": "good"},
        {"name": "Chris Vaughn", "sent": "3.6", "calls": 15, "esc": "4%", "color": "good"},
    ],
    "footnote": "Cancellation-labeled calls only. Escalation = supervisor transfer "
                "or callback request detected by labeler.",
}

SAVED_ITEMS = [
    {"id": "s1", "title": "Weekly driver report — W30",
     "desc": "Auto-generated Monday summary: drivers, sentiment deltas, agent flags.",
     "meta": "Saved Jul 27 · report · recurring"},
    {"id": "s2", "title": "Cancellation coaching list",
     "desc": "6 agents, 14 flagged calls grouped by failure pattern.",
     "meta": "Saved Jul 26 · list · shared with Team Leads"},
    {"id": "s3", "title": "Invoice-cycle billing spike",
     "desc": "Chart pack: billing dispute volume vs. invoice dates, 8 weeks.",
     "meta": "Saved Jul 22 · charts"},
]

PIPELINE_STAGES = [
    {"label": "WAV ingest", "sub": "S3 → Autoloader · 15-min trigger",
     "status": "HEALTHY", "level": "good"},
    {"label": "Transcription", "sub": "Whisper batch · GPU cluster",
     "status": "HEALTHY", "level": "good"},
    {"label": "Labeling — Claude Opus", "sub": "Prompt set v14 · 12 labels per call",
     "status": "RUNNING", "level": "good"},
    {"label": "Gold tables", "sub": "sonar.gold.calls_labeled · Delta",
     "status": "LAG 12m", "level": "warn"},
]

LABELING_PROMPTS = [
    {"label": "Call driver classification", "model": "OPUS",
     "sub": "Assigns one primary + up to two secondary drivers from the agreed "
            "taxonomy (14 categories)."},
    {"label": "Sentiment scoring", "model": "OPUS",
     "sub": "Customer sentiment 1–5 with turning-point detection and per-segment "
            "scores."},
    {"label": "Escalation & risk flags", "model": "SONNET",
     "sub": "Supervisor requests, churn signals, compliance phrases, "
            "repeat-contact prediction."},
    {"label": "QA rubric check", "model": "SONNET",
     "sub": "Greeting, disclosure, hold etiquette, resolution confirmation — "
            "pass/fail per item."},
]

BOOTSTRAP = {
    "workspace": "Acme CX · Production",
    "user": {"name": "Jordan Tate", "initials": "JT", "role": "QA Director",
             "email": "jordan.tate@acmecx.com"},
    "statusPill": "Pipeline live · 1,198 calls this week",
    "suggestions": [
        "Primary call drivers last week",
        "Categories with low sentiment",
        "Agents below sentiment average",
        "Escalation rate trend, 30 days",
    ],
    "disclaimer": "Sonar answers from labeled pipeline data · Jul 20–26 window · "
                  "verify before coaching decisions",
    "thinkingLabels": ["Querying labeled calls…", "Scoring 1,198 transcripts…"],
}


def deepcopy(value: Any) -> Any:
    """Fixtures are module-level singletons; hand out copies so callers can't
    mutate the seed."""
    return copy.deepcopy(value)
