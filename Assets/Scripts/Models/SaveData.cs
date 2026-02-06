using System;
using System.Collections.Generic;

namespace DetectiveGame.Models
{
    /// <summary>
    /// Player progress data saved to PlayerPrefs.
    /// </summary>
    [Serializable]
    public class SaveData
    {
        public string caseId;
        public List<string> collectedClueIds = new List<string>();
        public List<string> importantClueIds = new List<string>();
        public List<string> unlockedQuestionIds = new List<string>();
        public List<string> askedQuestionIds = new List<string>();
        public List<TimelineEntry> timelineEntries = new List<TimelineEntry>();
        public int currentSceneIndex;
        public DeductionSelections deductionSelections = new DeductionSelections();
    }

    [Serializable]
    public class TimelineEntry
    {
        public TimelineEntryType type;
        public string description;
        public string timestamp;
        public string relatedId; // clueId, questionId, etc.
    }

    [Serializable]
    public enum TimelineEntryType
    {
        ClueFound,
        QuestionAsked,
        QuestionUnlocked,
        ClueUnlocked,
        DeductionMade,
        CaseStarted
    }

    [Serializable]
    public class DeductionSelections
    {
        public string selectedKillerId;
        public string selectedMotiveId;
        public string selectedWeaponId;
        public string selectedKeyEvidenceId;
    }
}
