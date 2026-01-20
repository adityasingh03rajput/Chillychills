import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, X, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';

interface Staff {
  id: string;
  name: string;
  role: 'Cook' | 'Manager';
  status: 'active' | 'inactive';
}

interface StaffManagerProps {
  staff: Staff[];
  onUpdateStaff: (staff: Staff[]) => void;
}

export const StaffManager = ({ staff: initialStaff, onUpdateStaff }: StaffManagerProps) => {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<Staff | null>(null);
  const [managerPassword, setManagerPassword] = useState('');
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Cook' as 'Cook' | 'Manager',
    id: '',
  });

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.id) {
      toast.error('Please fill in all fields');
      return;
    }

    if (staff.some(s => s.id === newStaff.id)) {
      toast.error('Staff ID already exists');
      return;
    }

    const staffMember: Staff = {
      id: newStaff.id,
      name: newStaff.name,
      role: newStaff.role,
      status: 'active',
    };

    const updated = [...staff, staffMember];
    setStaff(updated);
    onUpdateStaff(updated);
    setNewStaff({ name: '', role: 'Cook', id: '' });
    setShowAddModal(false);
    toast.success(`${newStaff.name} added as ${newStaff.role}`);
  };

  const handleRemoveStaff = () => {
    if (managerPassword !== 'manager123') {
      toast.error('Incorrect manager password');
      return;
    }

    if (!staffToRemove) return;

    const updated = staff.filter(s => s.id !== staffToRemove.id);
    setStaff(updated);
    onUpdateStaff(updated);
    setStaffToRemove(null);
    setManagerPassword('');
    setShowRemoveModal(false);
    toast.success(`${staffToRemove.name} removed from staff`);
  };

  return (
    <div className="space-y-3">
      {/* Add Staff Button */}
      <Button 
        size="sm" 
        className="w-full bg-[#3F8A4F] gap-2"
        onClick={() => setShowAddModal(true)}
      >
        <Plus size={16} /> Add Staff Member
      </Button>

      {/* Staff List */}
      {staff.map((member) => (
        <div 
          key={member.id}
          className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center"
        >
          <div>
            <h4 className="font-bold text-white text-sm">{member.name}</h4>
            <p className="text-xs text-white/60">{member.role} • {member.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded ${
              member.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {member.status.toUpperCase()}
            </span>
            <button
              onClick={() => {
                setStaffToRemove(member);
                setShowRemoveModal(true);
              }}
              className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1E1E1E] rounded-t-3xl border-t border-white/10 max-h-[75vh] flex flex-col"
            >
              <div className="p-4 flex justify-between items-center border-b border-white/5">
                <h3 className="text-lg font-bold text-[#FF7A2F]">Add Staff Member</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block">STAFF NAME</label>
                  <Input
                    placeholder="e.g., John Doe"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="bg-white/5 text-white border-white/10"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block">STAFF ID</label>
                  <Input
                    placeholder="e.g., cook_003"
                    value={newStaff.id}
                    onChange={(e) => setNewStaff({ ...newStaff, id: e.target.value })}
                    className="bg-white/5 text-white border-white/10"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block">ROLE</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as 'Cook' | 'Manager' })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm"
                  >
                    <option value="Cook">Cook</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <Button 
                  onClick={handleAddStaff}
                  className="w-full bg-gradient-to-r from-[#FF7A2F] to-[#E06925] py-6"
                >
                  <Plus size={18} className="mr-2" /> Add Staff
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Remove Staff Modal */}
      <AnimatePresence>
        {showRemoveModal && staffToRemove && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[70] backdrop-blur-sm"
              onClick={() => setShowRemoveModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-[#1E1E1E] rounded-2xl border border-red-500/30 p-6 max-w-sm w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Shield className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Remove Staff Member</h3>
                  <p className="text-white/60 text-xs">Manager password required</p>
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-lg mb-4">
                <p className="text-white text-sm mb-2">
                  Removing: <span className="font-bold text-[#FF7A2F]">{staffToRemove.name}</span>
                </p>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-white/60 mb-2 block">MANAGER PASSWORD</label>
                <Input
                  type="password"
                  placeholder="Enter manager password"
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  className="bg-white/5 text-white border-white/10"
                />
                <p className="text-[10px] text-white/40 mt-1">Hint: manager123</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowRemoveModal(false);
                    setManagerPassword('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600" 
                  onClick={handleRemoveStaff}
                >
                  Remove
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
