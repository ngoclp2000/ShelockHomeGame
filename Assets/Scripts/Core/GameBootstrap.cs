using UnityEngine;
using DetectiveGame.Systems;

namespace DetectiveGame.Core
{
    /// <summary>
    /// Entry point for the game. Initializes all core services and handles startup routing.
    /// Attach this to a GameObject in the first loaded scene (MainMenu or a Bootstrap scene).
    /// </summary>
    public class GameBootstrap : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private string defaultCaseId = "case_001";
        [SerializeField] private bool autoLoadLastCase = true;

        private static bool _isInitialized = false;

        private void Awake()
        {
            if (_isInitialized)
            {
                Destroy(gameObject);
                return;
            }

            InitializeGame();
            _isInitialized = true;
        }

        private void InitializeGame()
        {
            Debug.Log("[GameBootstrap] Initializing game...");

            // Ensure core services exist
            EnsureService<CaseLoader>("CaseLoader");
            EnsureService<SaveService>("SaveService");
            EnsureService<SceneRouter>("SceneRouter");

            // Initialize systems
            InitializeSystems();

            Debug.Log("[GameBootstrap] Game initialized successfully.");
        }

        private void EnsureService<T>(string serviceName) where T : Component
        {
            if (FindObjectOfType<T>() == null)
            {
                var serviceGO = new GameObject($"[{serviceName}]");
                serviceGO.AddComponent<T>();
                DontDestroyOnLoad(serviceGO);
                Debug.Log($"[GameBootstrap] Created service: {serviceName}");
            }
        }

        private void InitializeSystems()
        {
            // Systems are static or use singletons, just ensure event bus is clean
            EventBus.ClearAllSubscriptions();
        }

        /// <summary>
        /// Call this from MainMenu UI to start a new case.
        /// </summary>
        public void StartNewCase(string caseId = null)
        {
            caseId = caseId ?? defaultCaseId;
            
            // Clear any existing save for fresh start
            SaveService.Instance?.ClearProgress(caseId);
            
            SceneRouter.Instance?.StartCase(caseId);
        }

        /// <summary>
        /// Call this from MainMenu UI to continue last case.
        /// </summary>
        public void ContinueCase()
        {
            string lastCaseId = SaveService.Instance?.GetLastCaseId();
            
            if (!string.IsNullOrEmpty(lastCaseId) && SaveService.Instance.HasSave(lastCaseId))
            {
                SceneRouter.Instance?.StartCase(lastCaseId);
            }
            else
            {
                Debug.LogWarning("[GameBootstrap] No save found to continue. Starting new case.");
                StartNewCase();
            }
        }

        /// <summary>
        /// Check if there's a save to continue.
        /// </summary>
        public bool HasContinuableCase()
        {
            string lastCaseId = SaveService.Instance?.GetLastCaseId();
            return !string.IsNullOrEmpty(lastCaseId) && SaveService.Instance.HasSave(lastCaseId);
        }

        /// <summary>
        /// Get the default case ID.
        /// </summary>
        public string GetDefaultCaseId()
        {
            return defaultCaseId;
        }
    }
}
