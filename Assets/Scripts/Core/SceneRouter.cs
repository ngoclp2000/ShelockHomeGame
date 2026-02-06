using UnityEngine;
using UnityEngine.SceneManagement;
using System;

namespace DetectiveGame.Core
{
    /// <summary>
    /// Handles scene transitions and routing between game states.
    /// </summary>
    public class SceneRouter : MonoBehaviour
    {
        public static SceneRouter Instance { get; private set; }

        public const string SCENE_MAIN_MENU = "MainMenu";
        public const string SCENE_INVESTIGATION = "Investigation";

        public event Action<string> OnSceneLoadStarted;
        public event Action<string> OnSceneLoadCompleted;

        private string _pendingCaseId;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void OnEnable()
        {
            SceneManager.sceneLoaded += HandleSceneLoaded;
        }

        private void OnDisable()
        {
            SceneManager.sceneLoaded -= HandleSceneLoaded;
        }

        /// <summary>
        /// Navigate to Main Menu.
        /// </summary>
        public void GoToMainMenu()
        {
            OnSceneLoadStarted?.Invoke(SCENE_MAIN_MENU);
            SceneManager.LoadScene(SCENE_MAIN_MENU);
        }

        /// <summary>
        /// Start a new case or continue existing case.
        /// </summary>
        public void StartCase(string caseId)
        {
            _pendingCaseId = caseId;
            OnSceneLoadStarted?.Invoke(SCENE_INVESTIGATION);
            SceneManager.LoadScene(SCENE_INVESTIGATION);
        }

        /// <summary>
        /// Continue the last played case.
        /// </summary>
        public void ContinueLastCase()
        {
            string lastCaseId = SaveService.Instance?.GetLastCaseId();
            if (!string.IsNullOrEmpty(lastCaseId))
            {
                StartCase(lastCaseId);
            }
            else
            {
                Debug.LogWarning("[SceneRouter] No last case found to continue.");
            }
        }

        /// <summary>
        /// Get the pending case ID (set before loading investigation scene).
        /// </summary>
        public string GetPendingCaseId()
        {
            return _pendingCaseId;
        }

        /// <summary>
        /// Clear the pending case ID after it's been used.
        /// </summary>
        public void ClearPendingCaseId()
        {
            _pendingCaseId = null;
        }

        private void HandleSceneLoaded(Scene scene, LoadSceneMode mode)
        {
            Debug.Log($"[SceneRouter] Scene loaded: {scene.name}");
            OnSceneLoadCompleted?.Invoke(scene.name);
        }

        /// <summary>
        /// Get current scene name.
        /// </summary>
        public string GetCurrentSceneName()
        {
            return SceneManager.GetActiveScene().name;
        }

        /// <summary>
        /// Check if we're in investigation mode.
        /// </summary>
        public bool IsInInvestigation()
        {
            return GetCurrentSceneName() == SCENE_INVESTIGATION;
        }
    }
}
