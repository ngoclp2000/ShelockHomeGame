using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Bottom navigation tab bar with 4 tabs: Scene, Clues, Suspects, Deduction.
    /// </summary>
    public class BottomTabBar : MonoBehaviour
    {
        [Serializable]
        public class TabButton
        {
            public Button button;
            public Image icon;
            public TextMeshProUGUI label;
            public GameObject badge;
            public Sprite activeIcon;
            public Sprite inactiveIcon;
        }

        [Header("Tab Buttons")]
        [SerializeField] private TabButton sceneTab;
        [SerializeField] private TabButton cluesTab;
        [SerializeField] private TabButton suspectsTab;
        [SerializeField] private TabButton deductionTab;

        [Header("Colors")]
        [SerializeField] private Color activeColor = new Color(0.2f, 0.15f, 0.1f);
        [SerializeField] private Color inactiveColor = new Color(0.5f, 0.45f, 0.4f);

        private TabButton[] _tabs;
        private int _activeTabIndex = 0;

        public event Action<int> OnTabSelected;

        private void Awake()
        {
            _tabs = new[] { sceneTab, cluesTab, suspectsTab, deductionTab };
        }

        private void Start()
        {
            // Set up button click handlers
            if (sceneTab?.button != null)
                sceneTab.button.onClick.AddListener(() => OnTabClick(0));
            if (cluesTab?.button != null)
                cluesTab.button.onClick.AddListener(() => OnTabClick(1));
            if (suspectsTab?.button != null)
                suspectsTab.button.onClick.AddListener(() => OnTabClick(2));
            if (deductionTab?.button != null)
                deductionTab.button.onClick.AddListener(() => OnTabClick(3));

            // Initialize visual state
            UpdateTabVisuals();
            HideAllBadges();
        }

        private void OnTabClick(int tabIndex)
        {
            if (tabIndex == _activeTabIndex) return;

            SetActiveTab(tabIndex);
            OnTabSelected?.Invoke(tabIndex);

            // Notify UIManager
            UIManager.Instance?.ShowPanel((UIManager.PanelType)tabIndex);
        }

        /// <summary>
        /// Set the active tab (called externally to sync state).
        /// </summary>
        public void SetActiveTab(int tabIndex)
        {
            if (tabIndex < 0 || tabIndex >= _tabs.Length) return;

            _activeTabIndex = tabIndex;
            UpdateTabVisuals();
        }

        private void UpdateTabVisuals()
        {
            for (int i = 0; i < _tabs.Length; i++)
            {
                bool isActive = i == _activeTabIndex;
                SetTabVisual(_tabs[i], isActive);
            }
        }

        private void SetTabVisual(TabButton tab, bool isActive)
        {
            if (tab == null) return;

            // Update icon
            if (tab.icon != null)
            {
                tab.icon.sprite = isActive ? tab.activeIcon : tab.inactiveIcon;
                tab.icon.color = isActive ? activeColor : inactiveColor;
            }

            // Update label color
            if (tab.label != null)
            {
                tab.label.color = isActive ? activeColor : inactiveColor;
                tab.label.fontStyle = isActive ? FontStyles.Bold : FontStyles.Normal;
            }
        }

        /// <summary>
        /// Show badge on a specific tab.
        /// </summary>
        public void ShowBadge(int tabIndex, int count = 0)
        {
            if (tabIndex < 0 || tabIndex >= _tabs.Length) return;

            var badge = _tabs[tabIndex].badge;
            if (badge != null)
            {
                badge.SetActive(true);
                
                // Update badge count if it has a text component
                var badgeText = badge.GetComponentInChildren<TextMeshProUGUI>();
                if (badgeText != null && count > 0)
                {
                    badgeText.text = count > 9 ? "9+" : count.ToString();
                }
            }
        }

        /// <summary>
        /// Hide badge on a specific tab.
        /// </summary>
        public void HideBadge(int tabIndex)
        {
            if (tabIndex < 0 || tabIndex >= _tabs.Length) return;
            _tabs[tabIndex].badge?.SetActive(false);
        }

        private void HideAllBadges()
        {
            foreach (var tab in _tabs)
            {
                tab.badge?.SetActive(false);
            }
        }

        /// <summary>
        /// Get the tab names for UI setup.
        /// </summary>
        public static string[] GetTabNames()
        {
            return new[] { "Scene", "Clues", "Suspects", "Deduction" };
        }
    }
}
