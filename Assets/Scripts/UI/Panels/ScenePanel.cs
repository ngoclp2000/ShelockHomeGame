using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using DetectiveGame.Models;
using DetectiveGame.Core;
using DetectiveGame.Systems;
using DetectiveGame.Utils;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Scene panel showing background and interactive hotspots.
    /// </summary>
    public class ScenePanel : BasePanel
    {
        [Header("Scene Elements")]
        [SerializeField] private Image backgroundImage;
        [SerializeField] private RectTransform hotspotsContainer;
        [SerializeField] private GameObject hotspotPrefab;

        private List<HotspotView> _spawnedHotspots = new List<HotspotView>();
        private SceneData _currentScene;

        protected override void Awake()
        {
            base.Awake();
        }

        private void OnEnable()
        {
            EventBus.OnCaseLoaded += HandleCaseLoaded;
            EventBus.OnClueCollected += HandleClueCollected;
        }

        private void OnDisable()
        {
            EventBus.OnCaseLoaded -= HandleCaseLoaded;
            EventBus.OnClueCollected -= HandleClueCollected;
        }

        private void HandleCaseLoaded(CaseData caseData)
        {
            // Load first scene by default
            if (caseData.scenes != null && caseData.scenes.Count > 0)
            {
                LoadScene(caseData.scenes[0]);
            }
        }

        private void HandleClueCollected(ClueData clue)
        {
            // Update hotspot visual to show it's been collected
            foreach (var hotspot in _spawnedHotspots)
            {
                if (hotspot.ClueId == clue.id)
                {
                    hotspot.SetCollected(true);
                }
            }
        }

        /// <summary>
        /// Load a scene by its data.
        /// </summary>
        public void LoadScene(SceneData sceneData)
        {
            _currentScene = sceneData;

            // Load background sprite
            if (!string.IsNullOrEmpty(sceneData.backgroundSpritePath))
            {
                Sprite bgSprite = Resources.Load<Sprite>(sceneData.backgroundSpritePath);
                if (bgSprite != null)
                {
                    backgroundImage.sprite = bgSprite;
                }
            }

            // Spawn hotspots
            SpawnHotspots(sceneData.hotspots);

            Debug.Log($"[ScenePanel] Loaded scene: {sceneData.sceneId}");
        }

        private void SpawnHotspots(List<HotspotData> hotspots)
        {
            // Clear existing hotspots
            foreach (var hotspot in _spawnedHotspots)
            {
                if (hotspot != null)
                    Destroy(hotspot.gameObject);
            }
            _spawnedHotspots.Clear();

            if (hotspots == null || hotspotPrefab == null) return;

            foreach (var hotspotData in hotspots)
            {
                var hotspotGO = Instantiate(hotspotPrefab, hotspotsContainer);
                var hotspotView = hotspotGO.GetComponent<HotspotView>();

                if (hotspotView != null)
                {
                    hotspotView.Initialize(hotspotData);
                    hotspotView.OnClicked += HandleHotspotClicked;

                    // Check if already collected
                    bool isCollected = SaveService.Instance?.IsClueCollected(hotspotData.clueId) ?? false;
                    hotspotView.SetCollected(isCollected);

                    _spawnedHotspots.Add(hotspotView);
                }
            }
        }

        private void HandleHotspotClicked(HotspotView hotspot)
        {
            if (string.IsNullOrEmpty(hotspot.ClueId)) return;

            // Collect the clue
            ClueSystem.Instance?.CollectClue(hotspot.ClueId);
        }

        public override void Refresh()
        {
            // Re-check collected status for all hotspots
            foreach (var hotspot in _spawnedHotspots)
            {
                bool isCollected = SaveService.Instance?.IsClueCollected(hotspot.ClueId) ?? false;
                hotspot.SetCollected(isCollected);
            }
        }

        protected override void OnShown()
        {
            base.OnShown();
            Refresh();
        }
    }
}
