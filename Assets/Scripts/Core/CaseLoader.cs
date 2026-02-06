using System;
using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.Networking;
using DetectiveGame.Models;

namespace DetectiveGame.Core
{
    /// <summary>
    /// Loads case data from JSON files in StreamingAssets.
    /// Uses UnityWebRequest for cross-platform compatibility (Android, iOS, WebGL).
    /// </summary>
    public class CaseLoader : MonoBehaviour
    {
        public static CaseLoader Instance { get; private set; }

        public CaseData CurrentCase { get; private set; }
        public bool IsLoading { get; private set; }
        public bool IsLoaded { get; private set; }

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

        /// <summary>
        /// Load a case by its ID. JSON file should be at StreamingAssets/Cases/{caseId}.json
        /// </summary>
        public void LoadCase(string caseId, Action<CaseData> onComplete = null, Action<string> onError = null)
        {
            StartCoroutine(LoadCaseCoroutine(caseId, onComplete, onError));
        }

        private IEnumerator LoadCaseCoroutine(string caseId, Action<CaseData> onComplete, Action<string> onError)
        {
            IsLoading = true;
            IsLoaded = false;

            string fileName = $"{caseId}.json";
            string filePath = Path.Combine(Application.streamingAssetsPath, "Cases", fileName);

            // UnityWebRequest handles platform-specific paths (Android jar:file://, iOS file://, etc.)
            using (UnityWebRequest request = UnityWebRequest.Get(filePath))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        string jsonContent = request.downloadHandler.text;
                        CurrentCase = JsonUtility.FromJson<CaseData>(jsonContent);
                        IsLoaded = true;
                        
                        Debug.Log($"[CaseLoader] Successfully loaded case: {CurrentCase.title}");
                        Systems.EventBus.TriggerCaseLoaded(CurrentCase);
                        onComplete?.Invoke(CurrentCase);
                    }
                    catch (Exception ex)
                    {
                        string errorMsg = $"[CaseLoader] Failed to parse JSON: {ex.Message}";
                        Debug.LogError(errorMsg);
                        onError?.Invoke(errorMsg);
                    }
                }
                else
                {
                    string errorMsg = $"[CaseLoader] Failed to load file: {request.error}";
                    Debug.LogError(errorMsg);
                    onError?.Invoke(errorMsg);
                }
            }

            IsLoading = false;
        }

        /// <summary>
        /// Get a clue by its ID from the current case.
        /// </summary>
        public ClueData GetClue(string clueId)
        {
            if (CurrentCase?.clues == null) return null;
            return CurrentCase.clues.Find(c => c.id == clueId);
        }

        /// <summary>
        /// Get a suspect by their ID from the current case.
        /// </summary>
        public SuspectData GetSuspect(string suspectId)
        {
            if (CurrentCase?.suspects == null) return null;
            return CurrentCase.suspects.Find(s => s.id == suspectId);
        }

        /// <summary>
        /// Get a scene by its ID from the current case.
        /// </summary>
        public SceneData GetScene(string sceneId)
        {
            if (CurrentCase?.scenes == null) return null;
            return CurrentCase.scenes.Find(s => s.sceneId == sceneId);
        }

        /// <summary>
        /// Get scene by index.
        /// </summary>
        public SceneData GetSceneByIndex(int index)
        {
            if (CurrentCase?.scenes == null || index < 0 || index >= CurrentCase.scenes.Count) 
                return null;
            return CurrentCase.scenes[index];
        }
    }
}
