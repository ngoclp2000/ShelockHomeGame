using System;
using System.Collections.Generic;
using UnityEngine;
using DetectiveGame.Models;
using DetectiveGame.Core;

namespace DetectiveGame.Systems
{
    /// <summary>
    /// Manages the investigation notebook/timeline.
    /// </summary>
    public class NotebookSystem : MonoBehaviour
    {
        public static NotebookSystem Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
            }
        }

        /// <summary>
        /// Add an entry when a clue is found.
        /// </summary>
        public void AddClueFoundEntry(ClueData clue)
        {
            var entry = new TimelineEntry
            {
                type = TimelineEntryType.ClueFound,
                description = $"Tìm thấy manh mối: {clue.name}",
                timestamp = GetTimestamp(),
                relatedId = clue.id
            };

            AddEntry(entry);
        }

        /// <summary>
        /// Add an entry when a question is asked.
        /// </summary>
        public void AddQuestionAskedEntry(SuspectData suspect, QuestionData question)
        {
            var entry = new TimelineEntry
            {
                type = TimelineEntryType.QuestionAsked,
                description = $"Hỏi {suspect.name}: \"{TruncateText(question.text, 40)}\"",
                timestamp = GetTimestamp(),
                relatedId = question.id
            };

            AddEntry(entry);
        }

        /// <summary>
        /// Add an entry when a deduction is made.
        /// </summary>
        public void AddDeductionEntry(bool isCorrect, string explanation)
        {
            var entry = new TimelineEntry
            {
                type = TimelineEntryType.DeductionMade,
                description = isCorrect ? "✓ Phá án thành công!" : "✗ Suy luận chưa chính xác",
                timestamp = GetTimestamp(),
                relatedId = isCorrect.ToString()
            };

            AddEntry(entry);
        }

        /// <summary>
        /// Add a generic entry.
        /// </summary>
        public void AddEntry(TimelineEntry entry)
        {
            SaveService.Instance.AddTimelineEntry(entry);
            EventBus.TriggerTimelineUpdated(entry);
            
            Debug.Log($"[NotebookSystem] Entry added: {entry.description}");
        }

        /// <summary>
        /// Get all timeline entries in chronological order.
        /// </summary>
        public List<TimelineEntry> GetTimeline()
        {
            return SaveService.Instance?.CurrentSave?.timelineEntries ?? new List<TimelineEntry>();
        }

        /// <summary>
        /// Get entries of a specific type.
        /// </summary>
        public List<TimelineEntry> GetEntriesByType(TimelineEntryType type)
        {
            var result = new List<TimelineEntry>();
            var entries = GetTimeline();

            foreach (var entry in entries)
            {
                if (entry.type == type)
                {
                    result.Add(entry);
                }
            }

            return result;
        }

        /// <summary>
        /// Get the count of all entries.
        /// </summary>
        public int GetEntryCount()
        {
            return GetTimeline().Count;
        }

        private string GetTimestamp()
        {
            return DateTime.Now.ToString("HH:mm");
        }

        private string TruncateText(string text, int maxLength)
        {
            if (string.IsNullOrEmpty(text)) return "";
            if (text.Length <= maxLength) return text;
            return text.Substring(0, maxLength - 3) + "...";
        }
    }
}
