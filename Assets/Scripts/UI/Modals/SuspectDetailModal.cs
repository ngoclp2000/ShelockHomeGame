using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using DetectiveGame.Models;
using DetectiveGame.Core;
using DetectiveGame.Systems;

namespace DetectiveGame.UI
{
    /// <summary>
    /// Modal showing suspect details with dialogue questions.
    /// </summary>
    public class SuspectDetailModal : BaseModal
    {
        [Header("Profile")]
        [SerializeField] private TextMeshProUGUI nameText;
        [SerializeField] private TextMeshProUGUI bioText;
        [SerializeField] private Image avatarImage;

        [Header("Dialogue")]
        [SerializeField] private Transform questionsContainer;
        [SerializeField] private GameObject questionButtonPrefab;
        [SerializeField] private TextMeshProUGUI answerText;
        [SerializeField] private ScrollRect answerScrollRect;

        [Header("Buttons")]
        [SerializeField] private Button closeButton;

        private string _currentSuspectId;
        private List<GameObject> _spawnedQuestions = new List<GameObject>();

        protected override void Awake()
        {
            base.Awake();

            if (closeButton != null)
                closeButton.onClick.AddListener(Close);
        }

        private void OnEnable()
        {
            EventBus.OnQuestionUnlocked += HandleQuestionUnlocked;
        }

        private void OnDisable()
        {
            EventBus.OnQuestionUnlocked -= HandleQuestionUnlocked;
        }

        private void HandleQuestionUnlocked(string suspectId, QuestionData question)
        {
            // Refresh questions if this is the current suspect
            if (suspectId == _currentSuspectId)
            {
                RefreshQuestions();
            }
        }

        public override void SetData(object data)
        {
            _currentSuspectId = data as string;
            if (string.IsNullOrEmpty(_currentSuspectId)) return;

            SuspectData suspect = CaseLoader.Instance?.GetSuspect(_currentSuspectId);
            if (suspect == null) return;

            // Update profile
            if (nameText != null)
                nameText.text = suspect.name;

            if (bioText != null)
                bioText.text = suspect.bio;

            if (avatarImage != null && !string.IsNullOrEmpty(suspect.avatarPath))
            {
                Sprite sprite = Resources.Load<Sprite>(suspect.avatarPath);
                if (sprite != null)
                    avatarImage.sprite = sprite;
            }

            // Clear previous answer
            if (answerText != null)
            {
                answerText.text = "Chọn một câu hỏi để hỏi nghi phạm...";
            }

            RefreshQuestions();
        }

        private void RefreshQuestions()
        {
            ClearQuestions();

            var questions = DialogueSystem.Instance?.GetAvailableQuestions(_currentSuspectId);
            if (questions == null || questions.Count == 0) return;

            foreach (var question in questions)
            {
                SpawnQuestionButton(question);
            }
        }

        private void SpawnQuestionButton(QuestionData question)
        {
            if (questionButtonPrefab == null || questionsContainer == null) return;

            var buttonGO = Instantiate(questionButtonPrefab, questionsContainer);
            _spawnedQuestions.Add(buttonGO);

            var buttonText = buttonGO.GetComponentInChildren<TextMeshProUGUI>();
            var button = buttonGO.GetComponent<Button>();
            var checkMark = buttonGO.transform.Find("CheckMark")?.gameObject;

            if (buttonText != null)
                buttonText.text = question.text;

            // Check if already asked
            bool isAsked = DialogueSystem.Instance?.IsQuestionAsked(question.id) ?? false;
            if (checkMark != null)
                checkMark.SetActive(isAsked);

            // Visually indicate asked questions
            if (isAsked && buttonText != null)
            {
                buttonText.color = new Color(0.5f, 0.5f, 0.5f);
            }

            if (button != null)
            {
                string questionId = question.id; // Capture for closure
                button.onClick.AddListener(() => OnQuestionClicked(questionId));
            }
        }

        private void OnQuestionClicked(string questionId)
        {
            string answer = DialogueSystem.Instance?.AskQuestion(_currentSuspectId, questionId);
            
            if (answerText != null && !string.IsNullOrEmpty(answer))
            {
                answerText.text = answer;
                
                // Scroll to top of answer
                if (answerScrollRect != null)
                {
                    answerScrollRect.verticalNormalizedPosition = 1f;
                }
            }

            // Refresh to update asked status
            RefreshQuestions();
        }

        private void ClearQuestions()
        {
            foreach (var question in _spawnedQuestions)
            {
                if (question != null)
                    Destroy(question);
            }
            _spawnedQuestions.Clear();
        }

        protected override void OnHidden()
        {
            base.OnHidden();
            _currentSuspectId = null;
            ClearQuestions();
        }
    }
}
