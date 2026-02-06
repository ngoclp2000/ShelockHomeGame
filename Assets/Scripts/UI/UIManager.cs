using System;
using System.Collections.Generic;
using UnityEngine;
using DetectiveGame.Systems;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Central manager for all UI panels and modals.
    /// Handles panel transitions, modal stacking, and UI state.
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }

        [Header("Panel References")]
        [SerializeField] private RectTransform panelContainer;
        [SerializeField] private ScenePanel scenePanel;
        [SerializeField] private CluesPanel cluesPanel;
        [SerializeField] private SuspectsPanel suspectsPanel;
        [SerializeField] private DeductionPanel deductionPanel;
        [SerializeField] private NotebookPanel notebookPanel;

        [Header("Modal References")]
        [SerializeField] private ClueDetailModal clueDetailModal;
        [SerializeField] private SuspectDetailModal suspectDetailModal;
        [SerializeField] private ResultModal resultModal;
        [SerializeField] private ToastPopup toastPopup;

        [Header("Fixed UI")]
        [SerializeField] private BottomTabBar bottomTabBar;

        private BasePanel _currentPanel;
        private Stack<BaseModal> _modalStack = new Stack<BaseModal>();

        public enum PanelType
        {
            Scene,
            Clues,
            Suspects,
            Deduction,
            Notebook
        }

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

        private void OnEnable()
        {
            EventBus.OnPanelRequested += HandlePanelRequested;
            EventBus.OnToastRequested += ShowToast;
        }

        private void OnDisable()
        {
            EventBus.OnPanelRequested -= HandlePanelRequested;
            EventBus.OnToastRequested -= ShowToast;
        }

        private void Start()
        {
            // Initialize - hide all panels and modals
            HideAllPanels();
            HideAllModals();

            // Show Scene panel by default
            ShowPanel(PanelType.Scene);
        }

        private void HandlePanelRequested(string panelName)
        {
            if (Enum.TryParse<PanelType>(panelName, true, out var panelType))
            {
                ShowPanel(panelType);
            }
        }

        /// <summary>
        /// Show a panel with slide animation.
        /// </summary>
        public void ShowPanel(PanelType panelType)
        {
            BasePanel targetPanel = GetPanel(panelType);
            if (targetPanel == null || targetPanel == _currentPanel) return;

            // Hide current panel
            if (_currentPanel != null)
            {
                StartCoroutine(_currentPanel.Hide());
            }

            // Show new panel
            _currentPanel = targetPanel;
            StartCoroutine(targetPanel.Show());

            // Update tab bar
            bottomTabBar?.SetActiveTab((int)panelType);

            Debug.Log($"[UIManager] Showing panel: {panelType}");
        }

        /// <summary>
        /// Show a modal on top of current content.
        /// </summary>
        public void ShowModal(BaseModal modal, object data = null)
        {
            if (modal == null) return;

            modal.SetData(data);
            _modalStack.Push(modal);
            StartCoroutine(modal.Show());

            Debug.Log($"[UIManager] Showing modal: {modal.GetType().Name}");
        }

        /// <summary>
        /// Close the top-most modal.
        /// </summary>
        public void CloseTopModal()
        {
            if (_modalStack.Count > 0)
            {
                var modal = _modalStack.Pop();
                StartCoroutine(modal.Hide());
                EventBus.TriggerModalClosed();
            }
        }

        /// <summary>
        /// Close all modals.
        /// </summary>
        public void CloseAllModals()
        {
            while (_modalStack.Count > 0)
            {
                var modal = _modalStack.Pop();
                StartCoroutine(modal.Hide());
            }
        }

        /// <summary>
        /// Show clue detail modal.
        /// </summary>
        public void ShowClueDetail(string clueId)
        {
            ShowModal(clueDetailModal, clueId);
        }

        /// <summary>
        /// Show suspect detail modal.
        /// </summary>
        public void ShowSuspectDetail(string suspectId)
        {
            ShowModal(suspectDetailModal, suspectId);
        }

        /// <summary>
        /// Show result modal.
        /// </summary>
        public void ShowResult(bool isCorrect, string explanation)
        {
            ShowModal(resultModal, new ResultData { isCorrect = isCorrect, explanation = explanation });
        }

        /// <summary>
        /// Show toast notification.
        /// </summary>
        public void ShowToast(string message, string type = "info")
        {
            if (toastPopup != null)
            {
                toastPopup.Show(message, type);
            }
        }

        private BasePanel GetPanel(PanelType panelType)
        {
            switch (panelType)
            {
                case PanelType.Scene: return scenePanel;
                case PanelType.Clues: return cluesPanel;
                case PanelType.Suspects: return suspectsPanel;
                case PanelType.Deduction: return deductionPanel;
                case PanelType.Notebook: return notebookPanel;
                default: return null;
            }
        }

        private void HideAllPanels()
        {
            scenePanel?.gameObject.SetActive(false);
            cluesPanel?.gameObject.SetActive(false);
            suspectsPanel?.gameObject.SetActive(false);
            deductionPanel?.gameObject.SetActive(false);
            notebookPanel?.gameObject.SetActive(false);
        }

        private void HideAllModals()
        {
            clueDetailModal?.gameObject.SetActive(false);
            suspectDetailModal?.gameObject.SetActive(false);
            resultModal?.gameObject.SetActive(false);
        }

        /// <summary>
        /// Check if any modal is currently open.
        /// </summary>
        public bool IsModalOpen => _modalStack.Count > 0;
    }

    // Helper class for result data
    [Serializable]
    public class ResultData
    {
        public bool isCorrect;
        public string explanation;
    }
}
