import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './output.css'; // Ensure you have the Tailwind CSS file or your own custom CSS file
import he from 'he';

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
  </div>
);

const TriviaGame = () => {
  const [questionData, setQuestionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResultPage, setShowResultPage] = useState(false);
  const [error, setError] = useState('');

  const fetchQuestion = async (retryCount = 0) => {
    setError(''); // Clear any previous errors
    try {
      setLoading(true);
      const response = await axios.get('https://opentdb.com/api.php?amount=1');
      const questionInfo = response.data.results[0];

      setQuestionData({
        question: questionInfo.question,
        correct_answer: questionInfo.correct_answer,
        incorrect_answers: questionInfo.incorrect_answers,
      });

      setCorrectAnswer(questionInfo.correct_answer);
      setUserAnswer('');
      setIsAnswered(false);
    } catch (error) {
      if (error.response?.status === 429 && retryCount < 3) {
        // If error is 429 (Too Many Requests) and we haven't retried 3 times yet
        setTimeout(() => fetchQuestion(retryCount + 1), 1000); // Retry after 1 second
      } else {
        console.error('Error fetching the trivia question:', error);
        setError('Failed to fetch question. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setUserAnswer(answer);
  };

  const handleSubmit = () => {
    setIsAnswered(true);
    if (userAnswer === correctAnswer) {
      setCorrectCount((prevCount) => prevCount + 1);
    } else {
      setIncorrectCount((prevCount) => prevCount + 1);
    }
  };

  const handleNextQuestion = () => {
    if (questionNumber < 10) {
      setQuestionNumber((prevNumber) => prevNumber + 1);
      fetchQuestion(); // Fetch new question only on Next button click
    } else {
      setShowResultPage(true);
    }
  };

  useEffect(() => {
    fetchQuestion(); // Fetch the first question on initial render
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (showResultPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Quiz Finished!</h1>
        <div className="bg-white shadow-md rounded-lg p-6 w-96 text-center">
          <p className="text-lg text-gray-700 mb-2">Total Questions: {questionNumber}</p>
          <p className="text-lg text-green-600 mb-2">Correct Answers: {correctCount}</p>
          <p className="text-lg text-red-600">Incorrect Answers: {incorrectCount}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="bg-white shadow-2xl rounded-lg p-6 w-full max-w-xl border border-gray-200">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Question {questionNumber}</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>} {/* Display error message if present */}

        <p className="mb-4 text-lg text-gray-700">{he.decode(questionData?.question)}</p>

        <div className="mb-4">
          {[...(questionData?.incorrect_answers || []), questionData?.correct_answer]
            .sort()
            .map((answer, i) => (
              <div key={i} className="mb-2">
                <label className="inline-flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="answer"
                    value={answer}
                    onChange={() => handleAnswerSelect(answer)}
                    disabled={isAnswered}
                    className="form-radio text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-800">{he.decode(answer)}</span>
                </label>
              </div>
            ))}
        </div>

        {isAnswered && (
          <div className="mb-4 text-lg">
            {userAnswer === correctAnswer ? (
              <p className="text-green-600 font-semibold">Correct!</p>
            ) : (
              <p className="text-red-600 font-semibold">
                Wrong! The correct answer is: {he.decode(correctAnswer)}
              </p>
            )}
          </div>
        )}

        {!isAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={!userAnswer}
            className={`${
              !userAnswer ? 'opacity-50' : 'hover:bg-blue-600'
            } bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md transition-colors duration-300`}
          >
            Submit
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="bg-green-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default TriviaGame;
