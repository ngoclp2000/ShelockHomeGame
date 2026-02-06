using UnityEngine;
using DetectiveGame.Core;
using DetectiveGame.Systems;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Main controller for the Investigation scene.
    /// Initializes all systems and loads the case.
    /// </summary>
    public class InvestigationController : MonoBehaviour
    {
        [Header("Systems")]
        [SerializeField] private bool createSystemsIfMissing = true;

        private void Awake()
        {
            // Ensure systems exist
            if (createSystemsIfMissing)
            {
                EnsureSystem<ClueSystem>();
                EnsureSystem<DialogueSystem>();
                EnsureSystem<NotebookSystem>();
                EnsureSystem<DeductionSystem>();
            }
        }

        private void Start()
        {
            // Get the case ID to load
            string caseId = SceneRouter.Instance?.GetPendingCaseId();
            
            if (string.IsNullOrEmpty(caseId))
            {
                caseId = "case_001"; // Default for testing
                Debug.Log("[InvestigationController] No pending case ID, using default: case_001");
            }

            // Load the case
            LoadCase(caseId);
        }

        private void LoadCase(string caseId)
        {
            Debug.Log($"[InvestigationController] Loading case: {caseId}");

            // Load save data
            SaveService.Instance?.Load(caseId);

            // Load case data
            CaseLoader.Instance?.LoadCase(caseId, 
                onComplete: (caseData) => 
                {
                    Debug.Log($"[InvestigationController] Case loaded: {caseData.title}");
                    SceneRouter.Instance?.ClearPendingCaseId();
                },
                onError: (error) =>
                {
                    Debug.LogError($"[InvestigationController] Failed to load case: {error}");
                    EventBus.TriggerToast("Không thể tải vụ án!", "error");
                }
            );
        }

        private void EnsureSystem<T>() where T : Component
        {
            if (FindObjectOfType<T>() == null)
            {
                var systemGO = new GameObject($"[{typeof(T).Name}]");
                systemGO.AddComponent<T>();
                Debug.Log($"[InvestigationController] Created system: {typeof(T).Name}");
            }
        }
    }
}
