import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Users, Plus, UserPlus, Crown, Target, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const StudyGroupsPage = () => {
  const [groups, setGroups] = useState([
    {
      id: '1',
      name: 'Frontend Masters',
      description: 'React, Next.js, TypeScript enthusiasts',
      members: 12,
      owner: 'Sarah Chen',
      focus: ['React', 'TypeScript', 'Next.js'],
      isJoined: true
    },
    {
      id: '2',
      name: 'DSA Warriors',
      description: 'Daily DSA problem solving group',
      members: 25,
      owner: 'Mike Johnson',
      focus: ['Algorithms', 'Data Structures'],
      isJoined: false
    },
    {
      id: '3',
      name: 'System Design Study',
      description: 'Preparing for system design interviews',
      members: 15,
      owner: 'Alex Kumar',
      focus: ['System Design', 'Architecture'],
      isJoined: false
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    focus: ''
  });

  const handleJoinGroup = (groupId) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, isJoined: true, members: g.members + 1 } : g
    ));
    toast.success('Joined group successfully!');
  };

  const handleLeaveGroup = (groupId) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, isJoined: false, members: g.members - 1 } : g
    ));
    toast.success('Left group');
  };

  const handleCreateGroup = () => {
    if (!newGroup.name || !newGroup.description) {
      toast.error('Please fill in all fields');
      return;
    }

    const group = {
      id: Date.now().toString(),
      ...newGroup,
      members: 1,
      owner: 'You',
      focus: newGroup.focus.split(',').map(f => f.trim()),
      isJoined: true
    };

    setGroups([group, ...groups]);
    setNewGroup({ name: '', description: '', focus: '' });
    setShowCreateForm(false);
    toast.success('Study group created!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8" data-testid="study-groups-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Study Groups</h1>
          <p className="text-muted-foreground">Learn together, grow together</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-glow">
          <Plus className="w-5 h-5 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl space-y-4"
        >
          <h3 className="text-xl font-bold">Create New Study Group</h3>
          <Input
            placeholder="Group name"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            className="bg-card/50 border-border"
          />
          <Textarea
            placeholder="Description"
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            className="bg-card/50 border-border"
            rows={3}
          />
          <Input
            placeholder="Focus areas (comma separated)"
            value={newGroup.focus}
            onChange={(e) => setNewGroup({ ...newGroup, focus: e.target.value })}
            className="bg-card/50 border-border"
          />
          <div className="flex gap-3">
            <Button onClick={handleCreateGroup} className="btn-glow">Create Group</Button>
            <Button onClick={() => setShowCreateForm(false)} variant="outline">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* My Groups */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">My Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.filter(g => g.isJoined).map((group, idx) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-6 rounded-2xl border-2 border-indigo-500/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{group.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{group.description}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Crown className="w-4 h-4 text-violet-500" />
                    <span>Created by {group.owner}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.focus.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{group.members} members</span>
                </div>
                <Button 
                  onClick={() => handleLeaveGroup(group.id)} 
                  size="sm" 
                  variant="outline"
                >
                  Leave Group
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Discover Groups */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Discover Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.filter(g => !g.isJoined).map((group, idx) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-6 rounded-2xl hover:border-indigo-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{group.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{group.description}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Crown className="w-4 h-4 text-violet-500" />
                    <span>Created by {group.owner}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.focus.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{group.members} members</span>
                </div>
                <Button 
                  onClick={() => handleJoinGroup(group.id)} 
                  size="sm" 
                  className="btn-glow"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {groups.length === 0 && (
        <div className="glass p-12 rounded-2xl text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No study groups yet</h3>
          <p className="text-muted-foreground mb-6">Create or join a group to start learning together</p>
          <Button onClick={() => setShowCreateForm(true)} className="btn-glow">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Group
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudyGroupsPage;
