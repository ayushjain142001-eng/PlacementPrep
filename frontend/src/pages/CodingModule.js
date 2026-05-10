import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/api';
import { toast } from 'sonner';
import { Code, Play, CheckCircle, XCircle, Trophy, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

/**
 * Language templates with proper starter code
 */
const LANGUAGE_TEMPLATES = {
  python: (question) => `# ${question?.title || 'Problem'}
# ${question?.description?.substring(0, 80) || ''}...

def solution():
    """
    Write your solution here
    """
    pass

# Test your solution
if __name__ == "__main__":
    result = solution()
    print(result)
`,
  javascript: (question) => `// ${question?.title || 'Problem'}
// ${question?.description?.substring(0, 80) || ''}...

function solution() {
  // Write your solution here
  
}

// Test your solution
console.log(solution());
`,
  java: (question) => `// ${question?.title || 'Problem'}
// ${question?.description?.substring(0, 80) || ''}...

public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.solution());
    }
    
    public Object solution() {
        // Write your solution here
        return null;
    }
}
`,
  cpp: (question) => `// ${question?.title || 'Problem'}
// ${question?.description?.substring(0, 80) || ''}...

#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    auto solution() {
        // Write your solution here
        return 0;
    }
};

int main() {
    Solution sol;
    cout << sol.solution() << endl;
    return 0;
}
`
};

/**
 * Monaco editor language mappings
 */
const MONACO_LANGUAGE_MAP = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp'
};

const CodingModule = () => {
  // State management
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  // Refs
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  
  // Theme
  const { theme } = useTheme();

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Initialize code when questions load or question changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestion]) {
      const initialCode = LANGUAGE_TEMPLATES[language](questions[currentQuestion]);
      setCode(initialCode);
      setEditorKey(prev => prev + 1); // Force editor remount
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, questions]);

  // Handle language change - CRITICAL FIX
  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestion]) {
      const newCode = LANGUAGE_TEMPLATES[language](questions[currentQuestion]);
      setCode(newCode);
      setOutput('');
      setTestResults(null);
      setEditorKey(prev => prev + 1); // Force editor remount with new language
      
      toast.info(`Switched to ${language.toUpperCase()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/questions/coding?count=5');
      if (response.data && response.data.length > 0) {
        setQuestions(response.data);
        const initialCode = LANGUAGE_TEMPLATES[language](response.data[0]);
        setCode(initialCode);
        toast.success(`Loaded ${response.data.length} coding challenges`);
      } else {
        toast.error('No questions available');
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error(error.response?.data?.detail || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!code || code.trim() === '') {
      toast.error('Please write some code first!');
      return;
    }

    setRunning(true);
    setOutput('🔄 Running your code...\n');

    try {
      // Simulate local code execution (in production, use a sandbox API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful execution
      const mockOutput = `✅ Code executed successfully!

Language: ${language.toUpperCase()}
Lines of code: ${code.split('\n').length}

Sample Output:
--------------------
${language === 'python' ? '[0, 1, 1, 2, 3, 5, 8]' : 
  language === 'javascript' ? '[0, 1, 1, 2, 3, 5, 8]' :
  language === 'java' ? '[0, 1, 1, 2, 3, 5, 8]' : 
  '[0, 1, 1, 2, 3, 5, 8]'}

Note: This is a simulated execution. In production, code runs in a secure sandbox.`;
      
      setOutput(mockOutput);
      toast.success('Code executed successfully!');
    } catch (error) {
      const errorOutput = `❌ Execution Error:

${error.message || 'Unknown error occurred'}

Please check your code and try again.`;
      setOutput(errorOutput);
      toast.error('Code execution failed');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code || code.trim() === '') {
      toast.error('Please write some code before submitting!');
      return;
    }

    if (submitting) return;

    const question = questions[currentQuestion];
    setSubmitting(true);

    try {
      const response = await api.post('/coding/submit', {
        question_id: question.title,
        code: code,
        language: language,
      });

      const { score, passed, total, is_correct, results, error, xp_earned } = response.data;

      setTestResults({
        score: Math.round(score),
        passed,
        total,
        is_correct,
        results,
        xp: xp_earned,
        error,
      });

      // Build a clean output panel
      const lines = [];
      lines.push(`Test cases: ${passed}/${total} passed`);
      lines.push(`Score: ${Math.round(score)}%`);
      if (error) lines.push(`\n⚠️  ${error}`);
      (results || []).forEach((r, i) => {
        lines.push(`\nTest ${i + 1}: ${r.passed ? '✅ PASS' : '❌ FAIL'}`);
        if (!r.passed) {
          lines.push(`  Expected: ${JSON.stringify(r.expected)}`);
          lines.push(`  Got:      ${JSON.stringify(r.got)}`);
          if (r.error) lines.push(`  Error:    ${r.error}`);
        }
      });
      setOutput(lines.join('\n'));

      if (is_correct) {
        toast.success(`🎉 All tests passed! +${xp_earned} XP`);
      } else if (passed > 0) {
        toast.info(`${passed}/${total} tests passed`);
      } else {
        toast.error(error || 'No tests passed. Review your logic.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Submission failed. Please try again.';
      toast.error(errorMessage);
      setOutput(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setOutput('');
      setTestResults(null);
      // Code will be reset by useEffect
    } else {
      toast.info('You\'ve completed all questions!');
    }
  }, [currentQuestion, questions.length]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Set editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
    });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    
    // Confirm if user has written code
    if (code !== LANGUAGE_TEMPLATES[language](questions[currentQuestion])) {
      if (!window.confirm(`Switching language will reset your code. Continue?`)) {
        return;
      }
    }
    
    setLanguage(newLanguage);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-muted-foreground">Loading coding challenges...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Code className="w-16 h-16 text-muted-foreground" />
        <p className="text-foreground text-xl font-semibold">No questions available</p>
        <Button onClick={fetchQuestions} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6" data-testid="coding-module-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Coding Practice</h1>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-lg border border-border">
            <span className="text-sm text-muted-foreground mr-2">Language:</span>
            <span className="font-semibold text-foreground">{language.toUpperCase()}</span>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="glass px-4 py-2 rounded-lg border border-border focus:border-indigo-500 outline-none cursor-pointer hover:border-indigo-400 transition-colors"
            data-testid="language-selector"
          >
            <option value="python">🐍 Python</option>
            <option value="javascript" disabled>📜 JavaScript (coming soon)</option>
            <option value="java" disabled>☕ Java (coming soon)</option>
            <option value="cpp" disabled>⚡ C++ (coming soon)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="space-y-6">
          <motion.div
            key={`question-${currentQuestion}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl space-y-4 border border-border"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{question.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                question.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                question.difficulty === 'medium' ? 'bg-violet-500/20 text-violet-500 border border-violet-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {question.difficulty?.toUpperCase()}
              </span>
            </div>

            <p className="text-foreground whitespace-pre-line leading-relaxed">{question.description}</p>

            {/* Test Cases */}
            {question.test_cases && question.test_cases.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Test Cases:
                </h3>
                {question.test_cases.slice(0, 2).map((tc, idx) => (
                  <div key={idx} className="bg-card/50 p-3 rounded-lg border border-border text-sm font-mono space-y-1">
                    <div className="text-muted-foreground">
                      <span className="text-indigo-400 font-semibold">Input:</span> {JSON.stringify(tc.input)}
                    </div>
                    <div className="text-emerald-400">
                      <span className="text-emerald-500 font-semibold">Output:</span> {JSON.stringify(tc.output)}
                    </div>
                  </div>
                ))}
                {question.test_cases.length > 2 && (
                  <p className="text-xs text-muted-foreground">+ {question.test_cases.length - 2} more test cases (hidden)</p>
                )}
              </div>
            )}

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs border border-indigo-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Test Results */}
          {testResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-2xl space-y-4 border border-border"
            >
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-500" />
                Submission Results
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 rounded-lg border border-emerald-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Tests Passed</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {testResults.passed ?? 0} / {testResults.total ?? 0}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-4 rounded-lg border border-indigo-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <div className={`text-2xl font-bold ${testResults.is_correct ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {testResults.is_correct ? 'Accepted' : 'Failing'}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-4 rounded-lg border border-indigo-500/20">
                <div className="text-sm text-muted-foreground mb-1">Score</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-400">{testResults.score}%</span>
                  {testResults.xp > 0 && (
                    <span className="text-sm text-muted-foreground">+{testResults.xp} XP</span>
                  )}
                </div>
              </div>

              {testResults.error && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-sm text-red-300">
                  ⚠️ {testResults.error}
                </div>
              )}

              {currentQuestion < questions.length - 1 && (
                <Button onClick={handleNextQuestion} className="w-full btn-glow" data-testid="next-question-btn">
                  Next Question →
                </Button>
              )}
            </motion.div>
          )}
        </div>

        {/* Code Editor */}
        <div className="space-y-4">
          <motion.div
            key={`editor-${currentQuestion}-${language}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-4 rounded-2xl border border-border"
          >
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="code">
                  <Code className="w-4 h-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="output">
                  <Clock className="w-4 h-4 mr-2" />
                  Output
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <div className="monaco-editor-container rounded-lg overflow-hidden border border-border" style={{ height: '500px' }}>
                  <Editor
                    key={editorKey}
                    height="100%"
                    language={MONACO_LANGUAGE_MAP[language]}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={handleEditorDidMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on',
                      padding: { top: 16, bottom: 16 },
                      suggestOnTriggerCharacters: true,
                      quickSuggestions: true,
                      tabSize: language === 'python' ? 4 : 2,
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleRun}
                    variant="outline"
                    disabled={running || submitting}
                    className="flex-1"
                    data-testid="run-code-btn"
                  >
                    {running ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Code
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || running}
                    className="flex-1 btn-glow"
                    data-testid="submit-code-btn"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="output">
                <div className="bg-card rounded-lg p-4 h-[500px] overflow-auto font-mono text-sm border border-border">
                  <pre className="text-foreground whitespace-pre-wrap">
                    {output || '✨ Output will appear here after running your code...'}
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
