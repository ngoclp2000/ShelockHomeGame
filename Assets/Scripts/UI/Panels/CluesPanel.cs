using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using DetectiveGame.Models;
using DetectiveGame.Systems;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Panel displaying collected clues as a grid/list.
    /// </summary>
    public class CluesPanel : BasePanel
    {
        [Header("Clues Panel")]
        [SerializeField] private Transform cluesContainer;
        [SerializeField] private GameObject clueCardPrefab;
        [SerializeField] private TextMeshProUGUI emptyText;
        [SerializeField] private Toggle showImportantOnlyToggle;

        private List<GameObject> _spawnedCards = new List<GameObject>();
        private bool _showImportantOnly = false;

        protected override void Awake()
        {
            base.Awake();
        }

        private void OnEnable()
        {
            EventBus.OnClueCollected += HandleClueCollected;
            EventBus.OnClueMarkedImportant += HandleClueMarkedImportant;

            if (showImportantOnlyToggle != null)
            {
                showImportantOnlyToggle.onValueChanged.AddListener(OnImportantToggleChanged);
            }
        }

        private void OnDisable()
        {
            EventBus.OnClueCollected -= HandleClueCollected;
            EventBus.OnClueMarkedImportant -= HandleClueMarkedImportant;

            if (showImportantOnlyToggle != null)
            {
                showImportantOnlyToggle.onValueChanged.RemoveListener(OnImportantToggleChanged);
            }
        }

        private void HandleClueCollected(ClueData clue)
        {
            // Refresh if panel is visible
            if (_isVisible)
            {
                Refresh();
            }
        }

        private void HandleClueMarkedImportant(string clueId, bool isImportant)
        {
            if (_isVisible)
            {
                Refresh();
            }
        }

        private void OnImportantToggleChanged(bool value)
        {
            _showImportantOnly = value;
            Refresh();
        }

        public override void Refresh()
        {
            ClearCards();

            List<ClueData> clues = _showImportantOnly 
                ? ClueSystem.Instance?.GetImportantClues() 
                : ClueSystem.Instance?.GetCollectedClues();

            if (clues == null || clues.Count == 0)
            {
                if (emptyText != null)
                {
                    emptyText.gameObject.SetActive(true);
                    emptyText.text = _showImportantOnly 
                        ? "Chưa có manh mối quan trọng" 
                        : "Chưa tìm thấy manh mối nào";
                }
                return;
            }

            if (emptyText != null)
                emptyText.gameObject.SetActive(false);

            foreach (var clue in clues)
            {
                SpawnClueCard(clue);
            }
        }

        private void SpawnClueCard(ClueData clue)
        {
            if (clueCardPrefab == null || cluesContainer == null) return;

            var cardGO = Instantiate(clueCardPrefab, cluesContainer);
            _spawnedCards.Add(cardGO);

            // Set up card content
            var nameText = cardGO.transform.Find("NameText")?.GetComponent<TextMeshProUGUI>();
            var timeText = cardGO.transform.Find("TimeText")?.GetComponent<TextMeshProUGUI>();
            var starIcon = cardGO.transform.Find("StarIcon")?.gameObject;
            var button = cardGO.GetComponent<Button>();

            if (nameText != null)
                nameText.text = clue.name;

            if (timeText != null)
            {
                // Get timestamp from timeline
                var timeline = NotebookSystem.Instance?.GetTimeline();
                var entry = timeline?.Find(e => e.relatedId == clue.id);
                timeText.text = entry?.timestamp ?? "";
            }

            if (starIcon != null)
            {
                bool isImportant = ClueSystem.Instance?.IsImportant(clue.id) ?? false;
                starIcon.SetActive(isImportant);
            }

            if (button != null)
            {
                string clueId = clue.id; // Capture for closure
                button.onClick.AddListener(() => OnClueCardClicked(clueId));
            }
        }

        private void OnClueCardClicked(string clueId)
        {
            UIManager.Instance?.ShowClueDetail(clueId);
        }

        private void ClearCards()
        {
            foreach (var card in _spawnedCards)
            {
                if (card != null)
                    Destroy(card);
            }
            _spawnedCards.Clear();
        }

        protected override void OnShown()
        {
            base.OnShown();
            Refresh();
        }
    }
}
