#!/usr/bin/env python3
"""Provision native GitHub milestones for Faysk Lab (idempotent).

Usage (from a trusted CI workflow with Issues: write):
    GITHUB_TOKEN=... GITHUB_REPOSITORY=Faysk/faysk-lab python3 scripts/provision_milestones.py

No due dates are assigned. Only issues #3..#32 receive milestones.
Tracking issues #33..#41 remain outside native milestones to avoid double counting.
"""
from __future__ import annotations

import json
import os
import sys
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen

REPOSITORY = "Faysk/faysk-lab"
API_BASE = f"https://api.github.com/repos/{REPOSITORY}"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
EXPECTED = os.environ.get("GITHUB_REPOSITORY", REPOSITORY)
if EXPECTED != REPOSITORY:
    sys.exit(f"Refusing to manage milestones for {EXPECTED!r}; expected {REPOSITORY!r}")
if not TOKEN:
    sys.exit("GITHUB_TOKEN is required (scoped to Issues: write).")

MILESTONES = (
    {
        "id": "M00", "title": "M00 — Architecture Gate",
        "tracker": 33, "issues": [3, 4, 5, 6, 7],
        "purpose": "ADR, escopo e limites dos modos Web/Agent, contrato versionado, auditoria ResetExplode, UX e threat model.",
        "gate": "Design e riscos aprovados; scan passivo inalterado; zero coleta oculta.",
    },
    {
        "id": "M01", "title": "M01 — v0.5.0 Web Utility",
        "tracker": 34, "issues": [10, 11, 12, 13],
        "purpose": "Rede HTTP, análise da pasta escolhida, importação JSON e export/diff sanitizado.",
        "gate": "Sem instalação, nenhum upload implícito; validações, privacidade e regressão aprovadas.",
    },
    {
        "id": "M02", "title": "M02 — v0.6.0 Web Labs",
        "tracker": 35, "issues": [8, 9, 14],
        "purpose": "Benchmarks CPU e GPU opt-in, compatibilidade WebGPU/WebGL, experiência Serial/USB isolada.",
        "gate": "Teste cancelável e limitado; sem prompt no boot; políticas CSP/Permissions-Policy verificadas.",
    },
    {
        "id": "M03", "title": "M03 — v0.7.0-alpha Agent Trust",
        "tracker": 36, "issues": [15, 16, 20, 21],
        "purpose": "Agente .NET read-only, inventário WMI, transporte seguro, pareamento e revogação.",
        "gate": "Sem admin global nem shell remoto; origin/token/replay testados; alpha restrito.",
    },
    {
        "id": "M04", "title": "M04 — v0.8.0-beta Hardware Monitor",
        "tracker": 37, "issues": [17, 18, 19, 22, 23, 24],
        "purpose": "Sensores CPU/GPU, S.M.A.R.T., bateria, ICMP, dashboard, relatório e pacote beta verificável.",
        "gate": "Fall-backs honestos, privacidade, integridade, Windows CI e desinstalação testados.",
    },
    {
        "id": "M05", "title": "M05 — v1.0.0 Stable",
        "tracker": 38, "issues": [31, 32],
        "purpose": "Release GA do modo Web e agente Windows read-only: QA, documentação, suporte e rollback.",
        "gate": "Todas as dependências dos M00–M04 aprovadas, segurança e regressões green, release auditada.",
    },
    {
        "id": "M06", "title": "M06 — v1.1.0 Performance & Games",
        "tracker": 39, "issues": [25, 26, 27],
        "purpose": "Benchmarks nativos controlados, FPS/frametime, overlay local, gargalos e jogos.",
        "gate": "Watchdog, cancel, anti-cheat e medições com metodologia transparente.",
    },
    {
        "id": "M07", "title": "M07 — v1.2.0 Local Operations",
        "tracker": 40, "issues": [28, 30],
        "purpose": "Helper privilegiado com operações reversíveis e alertas locais opt-in.",
        "gate": "Confirmação no host, allowlist e rollback testado; nenhum remote shell.",
    },
    {
        "id": "M08", "title": "M08 — v2.0.0-proposal Remote Multi-PC",
        "tracker": 41, "issues": [29],
        "purpose": "Proposta condicional de conta, vários PCs e relay Cloudflare outbound seguro.",
        "gate": "GO de produto, privacidade/RGPD, custos, isolamento de contas e revogação.",
    },
)

numbers = [n for item in MILESTONES for n in item["issues"]]
if sorted(numbers) != list(range(3, 33)) or len(numbers) != len(set(numbers)):
    sys.exit("Invalid milestone mapping: every issue #3..#32 must appear exactly once.")


def api(method: str, path: str, payload: dict | None = None):
    url = "https://api.github.com" + path
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8") if payload is not None else None
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "faysk-lab-milestones-bootstrap",
    }
    if data is not None:
        headers["Content-Type"] = "application/json"
    for attempt in range(4):
        try:
            with urlopen(Request(url, data=data, headers=headers, method=method), timeout=25) as response:
                return json.load(response)
        except HTTPError as error:
            body = error.read(1200).decode("utf-8", "replace")
            if error.code in (429, 500, 502, 503, 504) and attempt < 3:
                time.sleep(2**attempt)
                continue
            raise RuntimeError(f"GitHub {method} {path}: HTTP {error.code} {body}") from error


def list_milestones():
    found = []
    page = 1
    while True:
        batch = api("GET", f"/repos/{REPOSITORY}/milestones?state=all&per_page=100&page={page}")
        found.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return found


def main():
    existing = list_milestones()
    summary_lines = [
        "# Faysk Lab — Milestones nativos",
        "",
        "| Milestone | GitHub | Issues associadas |",
        "|---|---|---|",
    ]
    created = 0
    assigned = 0
    for m in MILESTONES:
        matches = [item for item in existing if item["title"] == m["title"]]
        similar = [item for item in existing if item["title"].startswith(m["id"]) and item not in matches]
        if not matches and similar:
            raise RuntimeError(
                f"Milestone with prefix {m['id']} exists under a different name; manual review needed: "
                + ", ".join(item["title"] for item in similar)
            )
        if len(matches) > 1:
            raise RuntimeError(f"Duplicate native milestones already exist: {m['title']}")
        if matches:
            item = matches[0]
            print(f"REUSE {m['title']} milestone #{item['number']}", flush=True)
            if item["state"] != "open":
                item = api("PATCH", f"/repos/{REPOSITORY}/milestones/{item['number']}", {"state": "open"})
        else:
            description = (
                f"Objetivo: {m['purpose']}\n"
                f"Gate GO/NO-GO: {m['gate']}\n"
                f"Detalhes/checklist: https://github.com/{REPOSITORY}/issues/{m['tracker']}\n"
                f"Plano: https://github.com/{REPOSITORY}/blob/main/docs/delivery-milestones.md\n"
                "Sem data de vencimento até aprovação de capacidade."
            )
            item = api("POST", f"/repos/{REPOSITORY}/milestones", {
                "title": m["title"], "state": "open", "description": description,
            })
            existing.append(item)
            created += 1
            print(f"CREATE {m['title']} milestone #{item['number']}", flush=True)
        number = item["number"]
        for issue_number in m["issues"]:
            issue = api("GET", f"/repos/{REPOSITORY}/issues/{issue_number}")
            old = issue.get("milestone")
            if old and old["number"] == number:
                print(f"KEEP issue #{issue_number} -> milestone #{number}", flush=True)
                assigned += 1
                continue
            if old and old["number"] != number:
                raise RuntimeError(
                    f"Issue #{issue_number} already assigned to another milestone "
                    f"#{old['number']} ({old['title']}); stopping instead of overwriting."
                )
            updated = api("PATCH", f"/repos/{REPOSITORY}/issues/{issue_number}", {"milestone": number})
            new = updated.get("milestone") or {}
            if new.get("number") != number:
                raise RuntimeError(f"Could not verify native milestone assignment for issue #{issue_number}")
            assigned += 1
            print(f"ASSIGN issue #{issue_number} -> {m['title']}", flush=True)
        summary_lines.append(
            f"| {m['id']} | [#{number}](https://github.com/{REPOSITORY}/milestone/{number}) "
            f"| {', '.join('#'+str(n) for n in m['issues'])} |"
        )
    if assigned != 30:
        raise RuntimeError(f"Only {assigned}/30 issue assignments checked")
    print(f"SUCCESS: {created} newly created milestones, {len(MILESTONES)} active, {assigned}/30 issue links")
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write("\n".join(summary_lines) + "\n")
    print("\n".join(summary_lines))


if __name__ == "__main__":
    main()
