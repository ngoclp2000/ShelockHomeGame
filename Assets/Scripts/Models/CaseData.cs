using System;
using System.Collections.Generic;

namespace DetectiveGame.Models
{
    /// <summary>
    /// Root data model for a case loaded from JSON.
    /// </summary>
    [Serializable]
    public class CaseData
    {
        public string caseId;
        public string title;
        public string introText;
        public List<SceneData> scenes;
        public List<ClueData> clues;
        public List<SuspectData> suspects;
        public List<MotiveData> motives;
        public List<WeaponData> weapons;
        public DeductionOptionsData deductionOptions;
        public SolutionData solution;
    }

    [Serializable]
    public class SceneData
    {
        public string sceneId;
        public string backgroundSpritePath;
        public List<HotspotData> hotspots;
    }

    [Serializable]
    public class HotspotData
    {
        public string hotspotId;
        public float x;
        public float y;
        public string clueId;
        public string label;
    }

    [Serializable]
    public class ClueData
    {
        public string id;
        public string name;
        public string description;
        public string spritePath;
        public List<string> tags;
    }

    [Serializable]
    public class SuspectData
    {
        public string id;
        public string name;
        public string avatarPath;
        public string bio;
        public List<QuestionData> questions;
    }

    [Serializable]
    public class QuestionData
    {
        public string id;
        public string text;
        public string answer;
        public UnlockData unlocks;
    }

    [Serializable]
    public class UnlockData
    {
        public List<string> questions;
        public List<string> clues;
    }

    [Serializable]
    public class MotiveData
    {
        public string id;
        public string text;
    }

    [Serializable]
    public class WeaponData
    {
        public string id;
        public string text;
    }

    [Serializable]
    public class DeductionOptionsData
    {
        public List<KeyEvidenceData> keyEvidences;
    }

    [Serializable]
    public class KeyEvidenceData
    {
        public string id;
        public string text;
        public string clueId; // Optional reference to a clue
    }

    [Serializable]
    public class SolutionData
    {
        public string killerId;
        public string motiveId;
        public string weaponId;
        public string keyEvidenceId;
        public string explanation;
    }
}
