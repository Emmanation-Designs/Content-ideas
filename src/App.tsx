/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Users, 
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Trash2, 
  Menu, 
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Send,
  History,
  Lightbulb,
  Copy,
  Trash,
  Star,
  PlusCircle,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Idea } from './types';
import { supabase } from './lib/supabase';
import { GoogleGenAI } from "@google/genai";

// --- Contexts ---

const ThemeContext = createContext<{ theme: 'light' | 'dark', toggleTheme: () => void }>({ theme: 'light', toggleTheme: () => {} });
const AuthContext = createContext<{ 
  user: any | null, 
  profile: UserProfile | null,
  loading: boolean, 
  logout: () => void,
  refreshProfile: () => Promise<void>
}>({ user: null, profile: null, loading: true, logout: () => {}, refreshProfile: async () => {} });

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }: any) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-black text-white dark:bg-white dark:text-black hover:opacity-80",
    secondary: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-950 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

// --- Views ---

const LoginView = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          // Create profile in users table
          const { error: profileError } = await supabase
            .from('users')
            .insert([{ id: data.user.id, email: data.user.email, name: name, role: 'Free' }]);
          if (profileError) throw profileError;
          setError('Registration successful! Please check your email for verification.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/content.png" alt="Logo" className="h-12 mx-auto mb-4 dark:invert" referrerPolicy="no-referrer" />
          <h1 className="text-2xl font-bold">Welcome to ProDash</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Professional management simplified</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className={`text-sm ${error.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </Button>
        </form>
        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-4 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
        </button>
      </Card>
    </div>
  );
};

const CreateIdeaView = () => {
  const { user, profile, refreshProfile } = useContext(AuthContext);
  const [prompt, setPrompt] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const generateIdea = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a creative and detailed business or product idea based on this prompt: ${prompt}. Provide a clear title and a description.`,
      });
      const text = response.text || "No response generated.";
      
      // Update local state (scrollable list)
      setGeneratedIdeas(prev => [text, ...prev]);

      // Save to Supabase
      const { error } = await supabase
        .from('ideas')
        .insert([{ user_id: user.id, prompt, generated_idea: text }]);
      
      if (error) throw error;
      setPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Create Idea</h2>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">Transform your thoughts into detailed concepts with AI.</p>
      </div>

      <Card className="p-2 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            placeholder="What's on your mind? (e.g., A sustainable coffee shop)"
            className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl bg-transparent text-base md:text-lg focus:outline-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateIdea()}
          />
          <Button 
            onClick={generateIdea} 
            disabled={generating}
            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {generating ? 'Generating...' : <><Send size={18} /> Generate</>}
          </Button>
        </div>
      </Card>
      
      <div className="space-y-4 md:space-y-6">
        <AnimatePresence mode="popLayout">
          {generatedIdeas.map((idea, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card className="group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {idea}
                </div>
                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(idea)}>
                    <Copy size={16} /> Copy
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {generatedIdeas.length === 0 && !generating && (
          <div className="text-center py-20 opacity-20">
            <Lightbulb size={80} className="mx-auto mb-4" />
            <p className="text-xl font-medium">Your generated ideas will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

const IdeasView = () => {
  const { user } = useContext(AuthContext);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIdeas = async () => {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error) setIdeas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIdeas();
  }, [user.id]);

  const deleteIdea = async (id: string) => {
    const { error } = await supabase.from('ideas').delete().eq('id', id);
    if (!error) setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const toggleFavorite = async (idea: Idea) => {
    const { error } = await supabase
      .from('ideas')
      .update({ is_favorite: !idea.is_favorite })
      .eq('id', idea.id);
    
    if (!error) {
      setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, is_favorite: !i.is_favorite } : i));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Your Ideas</h2>
          <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">Browse and manage your generated concepts.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-black dark:border-zinc-800 dark:border-t-white rounded-full animate-spin" />
        </div>
      ) : ideas.length === 0 ? (
        <Card className="text-center py-12 md:py-20 border-dashed border-zinc-200 dark:border-zinc-800">
          <History size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">No ideas generated yet. Head over to Create Idea!</p>
        </Card>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {ideas.map((idea) => (
            <Card key={idea.id} className="relative overflow-hidden group p-4 md:p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Prompt</p>
                    <p className="text-base md:text-lg font-medium text-zinc-900 dark:text-zinc-100 break-words">{idea.prompt}</p>
                  </div>
                  <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 shrink-0">{new Date(idea.created_at).toLocaleDateString()}</p>
                </div>
                
                <div className="p-3 md:p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {idea.generated_idea}
                  </p>
                </div>

                <div className="flex justify-end gap-1 md:gap-2 pt-2">
                  <Button variant="ghost" className="p-2" onClick={() => toggleFavorite(idea)}>
                    <Star size={18} className={idea.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-zinc-400"} />
                  </Button>
                  <Button variant="ghost" className="p-2" onClick={() => navigator.clipboard.writeText(idea.generated_idea)}>
                    <Copy size={18} className="text-zinc-400" />
                  </Button>
                  <Button variant="ghost" className="p-2 text-red-400 hover:text-red-500" onClick={() => deleteIdea(idea.id)}>
                    <Trash size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminView = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loading admin panel...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Admin Dashboard</h2>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="p-4 text-sm break-all">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === 'Admin' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                        : u.role === 'Pro' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-zinc-500 dark:text-zinc-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const SettingsView = () => {
  const { user, profile, refreshProfile, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [name, setName] = useState(profile?.name || '');
  const [activationKey, setActivationKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdateName = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      setMessage({ type: 'success', text: 'Name updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePro = async () => {
    if (!activationKey.trim()) return;
    setLoading(true);
    try {
      // 1. Validate the key from the activation_keys table in Supabase
      const { data: keyData, error: keyError } = await supabase
        .from('activation_keys')
        .select('*')
        .eq('key', activationKey.trim())
        .single();

      if (keyError || !keyData) {
        throw new Error('Invalid activation key.');
      }

      if (keyData.status !== 'active') {
        throw new Error('This activation key has already been used or is inactive.');
      }

      // 2. If the key exists and status = active:
      // - Update users.role to "Pro"
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ role: 'Pro' })
        .eq('id', user.id);

      if (userUpdateError) throw userUpdateError;

      // - Mark activation_keys.status = "used"
      // - Save activation_keys.used_by = current user id
      const { error: keyUpdateError } = await supabase
        .from('activation_keys')
        .update({ 
          status: 'used',
          used_by: user.id
        })
        .eq('id', keyData.id);

      if (keyUpdateError) throw keyUpdateError;

      await refreshProfile();
      setActivationKey('');
      setMessage({ type: 'success', text: 'Pro plan activated! Welcome aboard.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await supabase.from('users').delete().eq('id', user.id);
      logout();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold">Settings</h2>
      
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User size={20} /> Profile Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1">Display Name</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button onClick={handleUpdateName} disabled={loading || name === profile?.name} className="w-full sm:w-auto">
                Save
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-500 dark:text-zinc-400">Email Address</label>
            <p className="font-medium break-all">{user?.email}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={20} className="text-indigo-500" /> Subscription Plan
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="font-bold text-xl">Current Plan: {profile?.role}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {profile?.role === 'Free' ? 'Upgrade to unlock all features.' : 'You have full access to all features.'}
            </p>
          </div>
          {profile?.role === 'Pro' && (
            <div className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
              Active
            </div>
          )}
        </div>

        {profile?.role === 'Free' && (
          <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="font-bold mb-3">Pro Benefits:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  • Unlimited idea generation
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  • Full access to all features
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  • Priority AI processing
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-lg">Get Activation Key</h4>
              <Button 
                onClick={() => window.open('https://wa.me/447526596522?text=Hello%20I%20want%20to%20upgrade%20to%20Pro%20and%20get%20an%20activation%20key', '_blank')}
                className="w-full bg-green-600 hover:bg-green-700 text-white border-none py-3"
              >
                Get Activation Key on WhatsApp
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-lg">Activation Key Input</h4>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Enter Activation Key</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter key..."
                    className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent font-mono"
                    value={activationKey}
                    onChange={(e) => setActivationKey(e.target.value)}
                  />
                  <Button onClick={handleActivatePro} disabled={loading || !activationKey} className="w-full sm:w-auto">
                    Activate Pro
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium">Appearance</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Toggle between light and dark mode</p>
          </div>
          <Button variant="secondary" onClick={toggleTheme} className="w-full sm:w-auto">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Button variant="secondary" className="w-full justify-start text-red-500 hover:text-red-600" onClick={logout}>
          <LogOut size={20} /> Sign Out
        </Button>
        
        {!showDeleteConfirm ? (
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-red-500" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={20} /> Delete Account
          </Button>
        ) : (
          <Card className="border-red-500 bg-red-50 dark:bg-red-900/10 p-4 md:p-6">
            <p className="text-sm font-bold text-red-600 mb-4">Are you absolutely sure? This will delete all your ideas and account data permanently.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="danger" className="flex-1" onClick={handleDeleteAccount} disabled={loading}>
                {loading ? 'Deleting...' : 'Yes, Delete Everything'}
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)} disabled={loading}>
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// --- Main Layout ---

const MainLayout = () => {
  const { profile, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeView, setActiveView] = useState('create-idea');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'create-idea', label: 'Create Idea', icon: PlusCircle },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (profile?.role === 'Admin') {
    navItems.splice(2, 0, { id: 'admin', label: 'Admin Panel', icon: Users });
  }

  const renderView = () => {
    switch (activeView) {
      case 'create-idea': return <CreateIdeaView />;
      case 'ideas': return <IdeasView />;
      case 'admin': return <AdminView />;
      case 'settings': return <SettingsView />;
      default: return <CreateIdeaView />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors duration-300">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-50 w-72 h-full bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-900 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/content.png" alt="Logo" className="h-8 dark:invert" referrerPolicy="no-referrer" />
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight leading-none">ProDash</span>
              {profile?.role === 'Pro' && (
                <span className="text-[10px] font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded-md w-fit mt-0.5">PRO</span>
              )}
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
              {activeView === item.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-900">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 mb-4">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold shrink-0">
              {profile?.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile?.email}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{profile?.role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600" onClick={logout}>
            <LogOut size={20} /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-black flex items-center justify-between px-4 md:px-6 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
            <button className="flex items-center gap-2 text-sm font-medium hover:opacity-80" onClick={() => setActiveView('settings')}>
               <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Settings size={16} />
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// --- Root App ---

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const refreshProfile = async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) return;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!error) setProfile(data);
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) refreshProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) refreshProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center gap-4"
        >
          <img src="/content.png" alt="Logo" className="h-12 dark:invert" referrerPolicy="no-referrer" />
          <div className="w-48 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-full h-full bg-black dark:bg-white"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {user ? <MainLayout /> : <LoginView />}
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}
