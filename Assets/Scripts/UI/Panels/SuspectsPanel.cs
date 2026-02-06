using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using DetectiveGame.Models;
using DetectiveGame.Core;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Panel displaying suspects list.
    /// </summary>
    public class SuspectsPanel : BasePanel
    {
        [Header("Suspects Panel")]
        [SerializeField] private Transform suspectsContainer;
        [SerializeField] private GameObject suspectCardPrefab;
        [SerializeField] private TextMeshProUGUI emptyText;

        private List<GameObject> _spawnedCards = new List<GameObject>();

        protected override void Awake()
        {
            base.Awake();
        }

        private void OnEnable()
        {
            Systems.EventBus.OnCaseLoaded += HandleCaseLoaded;
        }

        private void OnDisable()
        {
            Systems.EventBus.OnCaseLoaded -= HandleCaseLoaded;
        }

        private void HandleCaseLoaded(CaseData caseData)
        {
            Refresh();
        }

        public override void Refresh()
        {
            ClearCards();

            var caseData = CaseLoader.Instance?.CurrentCase;
            if (caseData?.suspects == null || caseData.suspects.Count == 0)
            {
                if (emptyText != null)
                {
                    emptyText.gameObject.SetActive(true);
                    emptyText.text = "Chưa có nghi phạm nào";
                }
                return;
            }

            if (emptyText != null)
                emptyText.gameObject.SetActive(false);

            foreach (var suspect in caseData.suspects)
            {
                SpawnSuspectCard(suspect);
            }
        }

        private void SpawnSuspectCard(SuspectData suspect)
        {
            if (suspectCardPrefab == null || suspectsContainer == null) return;

            var cardGO = Instantiate(suspectCardPrefab, suspectsContainer);
            _spawnedCards.Add(cardGO);

            // Set up card content
            var nameText = cardGO.transform.Find("NameText")?.GetComponent<TextMeshProUGUI>();
            var bioText = cardGO.transform.Find("BioText")?.GetComponent<TextMeshProUGUI>();
            var avatarImage = cardGO.transform.Find("Avatar")?.GetComponent<Image>();
            var button = cardGO.GetComponent<Button>();

            if (nameText != null)
                nameText.text = suspect.name;

            if (bioText != null)
            {
                // Show truncated bio
                string bio = suspect.bio ?? "";
                bioText.text = bio.Length > 60 ? bio.Substring(0, 57) + "..." : bio;
            }

            if (avatarImage != null && !string.IsNullOrEmpty(suspect.avatarPath))
            {
                Sprite avatarSprite = Resources.Load<Sprite>(suspect.avatarPath);
                if (avatarSprite != null)
                    avatarImage.sprite = avatarSprite;
            }

            if (button != null)
            {
                string suspectId = suspect.id; // Capture for closure
                button.onClick.AddListener(() => OnSuspectCardClicked(suspectId));
            }
        }

        private void OnSuspectCardClicked(string suspectId)
        {
            UIManager.Instance?.ShowSuspectDetail(suspectId);
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
