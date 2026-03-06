import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import api from '../utils/api';
import { toast } from 'sonner';
import { Code, Play, CheckCircle, XCircle, Trophy, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const CodingModule = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [code, setCode] = useState('# Write your solution here\n\n');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions/coding?count=5');
      setQuestions(response.data);
      setCode(getStarterCode(response.data[0]));
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const getStarterCode = (question) => {
    if (language === 'python') {
      return `# ${question?.title || 'Problem'}\n# ${question?.description?.split('\\n')[0] || ''}\n\ndef solution():\n    # Write your code here\n    pass\n\n`;
    }
    return '// Write your solution here\n\n';
  };

  const handleRun = async () => {
    setOutput('Running code...');
    // Simulate code execution
    setTimeout(() => {
      setOutput('Code executed successfully!\n\nExample output:\n[0, 1]');
    }, 1000);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const question = questions[currentQuestion];
    
    try {
      const response = await api.post('/coding/submit', {
        question_id: question.title,
        code: code,
        language: language
      });
      
      const { score, analysis, xp_earned } = response.data;
      setTestResults(analysis);
      
      toast.success(`Score: ${Math.round(score)}% | +${xp_earned} XP earned!`);
    } catch (error) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCode(getStarterCode(questions[currentQuestion + 1]));
      setOutput('');
      setTestResults(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6" data-testid="coding-module-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Coding Practice</h1>
          <p className="text-slate-400">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="glass px-4 py-2 rounded-lg border border-slate-800 focus:border-indigo-500 outline-none"
            data-testid="language-selector"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{question.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {question.difficulty}
              </span>
            </div>

            <p className="text-slate-300 whitespace-pre-line">{question.description}</p>

            {/* Test Cases */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Test Cases:</h3>
              {question.test_cases?.map((tc, idx) => (
                <div key={idx} className="bg-slate-900/50 p-3 rounded-lg text-sm font-mono">
                  <div className="text-slate-400">Input: {JSON.stringify(tc.input)}</div>
                  <div className="text-green-400">Output: {JSON.stringify(tc.output)}</div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {question.tags?.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Test Results */}
          {testResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-2xl space-y-4"
            >
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Results
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Test Cases Passed</div>
                  <div className="text-2xl font-bold text-green-400">
                    {testResults.passed_tests} / {testResults.total_tests}
                  </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Code Quality</div>
                  <div className="text-2xl font-bold text-indigo-400">
                    {testResults.quality}/30
                  </div>
                </div>
              </div>

              {testResults.feedback?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Feedback:</h4>
                  {testResults.feedback.map((fb, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-yellow-500">•</span>
                      {fb}
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion < questions.length - 1 && (
                <Button onClick={handleNextQuestion} className="w-full btn-glow" data-testid="next-question-btn">
                  Next Question
                </Button>
              )}
            </motion.div>
          )}
        </div>

        {/* Code Editor */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-4 rounded-2xl"
          >
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <div className="monaco-editor-container" style={{ height: '500px' }}>
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleRun}
                    variant="outline"
                    className="flex-1"
                    data-testid="run-code-btn"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Code
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 btn-glow"
                    data-testid="submit-code-btn"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="output">
                <div className="bg-slate-900 rounded-lg p-4 h-[500px] overflow-auto font-mono text-sm">
                  <pre className="text-slate-300 whitespace-pre-wrap">
                    {output || 'Output will appear here...'}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CodingModule;
