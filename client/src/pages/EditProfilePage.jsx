import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { Sparkles, Save, ArrowLeft, Image, Link2, Hash, FileText, Loader } from 'lucide-react';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();

  // Form states loaded from user context
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [coverPic, setCoverPic] = useState(user?.coverPic || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  
  const [socialLinks, setSocialLinks] = useState({
    twitter: user?.socialLinks?.twitter || '',
    instagram: user?.socialLinks?.instagram || '',
    linkedin: user?.socialLinks?.linkedin || '',
    github: user?.socialLinks?.github || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Convert File to Base64
  const handleFileChange = async (e, setImgFunc) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      setImgFunc(fileReader.result);
    };
    fileReader.onerror = (err) => {
      console.error(err);
    };
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        bio,
        profilePic,
        coverPic,
        skills, // API handles array splitting from string
        socialLinks
      };

      const updatedData = await api.editUserProfile(payload);
      
      // Update local storage and context state
      updateUserProfile(updatedData);
      
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate(`/profile/${user.username}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-brand-border bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black">Edit Creator Profile</h1>
          <p className="text-xs text-slate-500">Refine your bio, skills, and social link badges</p>
        </div>
      </div>

      {message && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl p-3.5 font-semibold">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3.5 font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-12">
        
        {/* MEDIA PREVIEWS & SELECTIONS */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Image className="w-4.5 h-4.5 text-brand-purple" />
            <span>Profile Assets</span>
          </h3>

          <div className="flex flex-col gap-4">
            {/* Cover photo field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Cover Photo</label>
              <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-900 border border-brand-border relative group">
                {coverPic ? (
                  <img src={coverPic} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-brand-purple/10 to-brand-neonBlue/10 flex items-center justify-center text-xs text-slate-500">
                    No banner photo selected
                  </div>
                )}
                
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold text-white transition-opacity">
                  <Image className="w-4 h-4" />
                  <span>Upload Cover</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, setCoverPic)} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

            {/* Profile pic avatar field */}
            <div className="flex items-center gap-4 mt-2">
              <div className="relative">
                <img 
                  src={profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'} 
                  alt="Profile Preview" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-purple/60"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold">Profile Photo</label>
                <label className="cursor-pointer bg-brand-purple/10 border border-brand-purple/20 hover:bg-brand-purple/20 text-brand-purple px-4 py-2 rounded-xl text-xs font-bold transition-all">
                  <span>Choose Image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, setProfilePic)} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* BIO & SKILLS */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-brand-neonBlue" />
            <span>Identity Details</span>
          </h3>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something cool about yourself..."
                rows={3}
                className="w-full bg-white/5 border border-brand-border rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple focus:bg-white/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Skills & Interests</span>
                <span className="text-[10px] text-slate-500 font-normal">Comma-separated (e.g. React, Node, UI/UX)</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Python, Java, CSS, Cloud Computing"
                  className="w-full bg-white/5 border border-brand-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple focus:bg-white/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL LINKS HANDLES */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Link2 className="w-4.5 h-4.5 text-brand-neonPurple" />
            <span>Social Handles</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold">GitHub Username</label>
              <input 
                type="text"
                name="github"
                value={socialLinks.github}
                onChange={handleSocialChange}
                placeholder="github_username"
                className="w-full bg-white/5 border border-brand-border rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold">LinkedIn Username</label>
              <input 
                type="text"
                name="linkedin"
                value={socialLinks.linkedin}
                onChange={handleSocialChange}
                placeholder="linkedin_username"
                className="w-full bg-white/5 border border-brand-border rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold">Twitter Username</label>
              <input 
                type="text"
                name="twitter"
                value={socialLinks.twitter}
                onChange={handleSocialChange}
                placeholder="twitter_handle"
                className="w-full bg-white/5 border border-brand-border rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold">Instagram Username</label>
              <input 
                type="text"
                name="instagram"
                value={socialLinks.instagram}
                onChange={handleSocialChange}
                placeholder="instagram_handle"
                className="w-full bg-white/5 border border-brand-border rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full py-4 rounded-xl text-white font-bold btn-neon-purple shadow-neonPurple flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default EditProfilePage;
