using System.Collections.Generic;
using UnityEngine;
using TMPro;
using DetectiveGame.Models;
using DetectiveGame.Systems;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Panel displaying investigation timeline/notebook.
    /// </summary>
    public class NotebookPanel : BasePanel
    {
        [Header("Notebook Panel")]
        [SerializeField] private Transform entriesContainer;
        [SerializeField] private GameObject timelineEntryPrefab;
        [SerializeField] private TextMeshProUGUI emptyText;
        [SerializeField] private TextMeshProUGUI headerText;

        private List<GameObject> _spawnedEntries = new List<GameObject>();

        protected override void Awake()
        {
            base.Awake();
        }

        private void OnEnable()
        {
            EventBus.OnTimelineUpdated += HandleTimelineUpdated;
        }

        private void OnDisable()
        {
            EventBus.OnTimelineUpdated -= HandleTimelineUpdated;
        }

        private void HandleTimelineUpdated(TimelineEntry entry)
        {
            if (_isVisible)
            {
                Refresh();
            }
        }

        public override void Refresh()
        {
            ClearEntries();

            var timeline = NotebookSystem.Instance?.GetTimeline();
            if (timeline == null || timeline.Count == 0)
            {
                if (emptyText != null)
                {
                    emptyText.gameObject.SetActive(true);
                    emptyText.text = "Nhật ký điều tra trống";
                }
                if (headerText != null)
                    headerText.text = "Nhật ký điều tra (0)";
                return;
            }

            if (emptyText != null)
                emptyText.gameObject.SetActive(false);

            if (headerText != null)
                headerText.text = $"Nhật ký điều tra ({timeline.Count})";

            // Display in reverse chronological order (newest first)
            for (int i = timeline.Count - 1; i >= 0; i--)
            {
                SpawnTimelineEntry(timeline[i]);
            }
        }

        private void SpawnTimelineEntry(TimelineEntry entry)
        {
            if (timelineEntryPrefab == null || entriesContainer == null) return;

            var entryGO = Instantiate(timelineEntryPrefab, entriesContainer);
            _spawnedEntries.Add(entryGO);

            // Set up entry content
            var timeText = entryGO.transform.Find("TimeText")?.GetComponent<TextMeshProUGUI>();
            var descText = entryGO.transform.Find("DescriptionText")?.GetComponent<TextMeshProUGUI>();
            var iconImage = entryGO.transform.Find("Icon")?.GetComponent<UnityEngine.UI.Image>();

            if (timeText != null)
                timeText.text = entry.timestamp;

            if (descText != null)
                descText.text = entry.description;

            if (iconImage != null)
            {
                // Set icon color based on entry type
                iconImage.color = GetEntryColor(entry.type);
            }
        }

        private Color GetEntryColor(TimelineEntryType type)
        {
            switch (type)
            {
                case TimelineEntryType.ClueFound:
                    return new Color(0.2f, 0.6f, 0.8f); // Blue
                case TimelineEntryType.QuestionAsked:
                    return new Color(0.8f, 0.6f, 0.2f); // Orange
                case TimelineEntryType.QuestionUnlocked:
                    return new Color(0.6f, 0.4f, 0.8f); // Purple
                case TimelineEntryType.ClueUnlocked:
                    return new Color(0.2f, 0.7f, 0.4f); // Green
                case TimelineEntryType.DeductionMade:
                    return new Color(0.8f, 0.2f, 0.2f); // Red
                case TimelineEntryType.CaseStarted:
                    return new Color(0.4f, 0.4f, 0.4f); // Gray
                default:
                    return Color.white;
            }
        }

        private void ClearEntries()
        {
            foreach (var entry in _spawnedEntries)
            {
                if (entry != null)
                    Destroy(entry);
            }
            _spawnedEntries.Clear();
        }

        protected override void OnShown()
        {
            base.OnShown();
            Refresh();
        }
    }
}
