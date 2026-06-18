// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GiveUpButton } from "@/components/daily/GiveUpButton";
import { Leaderboard } from "@/components/daily/Leaderboard";
import { NameEntry } from "@/components/daily/NameEntry";
import { NextDailyNote } from "@/components/daily/NextDailyNote";
import { ShareCard } from "@/components/daily/ShareCard";
import type { LeaderboardEntry } from "@/lib/daily/types";

describe("GiveUpButton", () => {
  it("calls onGiveUp when clicked", () => {
    const onGiveUp = vi.fn();
    render(<GiveUpButton onGiveUp={onGiveUp} />);
    fireEvent.click(screen.getByRole("button", { name: /give up/i }));
    expect(onGiveUp).toHaveBeenCalledOnce();
  });
});

describe("NameEntry", () => {
  it("submits the typed name", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<NameEntry onSubmit={onSubmit} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Mike" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("Mike"));
  });

  it("shows an error when the name is rejected", async () => {
    const onSubmit = vi.fn().mockResolvedValue(false);
    render(<NameEntry onSubmit={onSubmit} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "fuck" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(await screen.findByText(/pick another name/i)).toBeInTheDocument();
  });
});

describe("ShareCard", () => {
  it("copies the text and confirms", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ShareCard text={"line1\nline2"} />);
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("line1\nline2"));
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
  });
});

describe("Leaderboard", () => {
  it("renders entries and highlights you", () => {
    const entries: LeaderboardEntry[] = [
      { name: "Nova", depth: 12, score: 9000, timeMs: 100000 },
      { name: "Mike", depth: 9, score: 4820, timeMs: 192000, isYou: true },
    ];
    render(<Leaderboard entries={entries} />);
    expect(screen.getByText("Nova")).toBeInTheDocument();
    expect(screen.getByText("Mike")).toBeInTheDocument();
    expect(screen.getByTestId("lb-you")).toHaveTextContent("Mike");
  });
});

describe("NextDailyNote", () => {
  it("shows the next daily date", () => {
    render(<NextDailyNote nextDate="2026-06-18" />);
    expect(screen.getByText(/2026-06-18/)).toBeInTheDocument();
  });
});
