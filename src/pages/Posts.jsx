import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, LayoutGrid, List, Trash2, CheckCircle, X } from 'lucide-react';
import { supabase } from '../supabase/supabase';
import CustomSelect from '../components/common/CustomSelect';
import DeletePostModal from '../components/posts/DeletePostModal';
import PostCard from '../components/posts/PostCard';
import PostListRow from '../components/posts/PostListRow';

const Posts = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brandColors, setBrandColors] = useState({
        KLM: '#002B72',
        KLS: '#4f46e5',
        KLC: '#0ea5e9'
    });
    const [userRole, setUserRole] = useState('member');
    const [userId, setUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [socialFilter, setSocialFilter] = useState('all');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [postTypeFilter, setPostTypeFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => { 
        fetchUserRole(); 
        fetchBrandSettings();
    }, [orgId]);
    useEffect(() => { if (userId) { fetchPosts(); } }, [userId, orgId, refreshTrigger]);

    useEffect(() => {
        const channel = new BroadcastChannel('posts_channel');
        channel.onmessage = (event) => {
            if (event.data === 'refresh_posts') {
                setRefreshTrigger(prev => prev + 1);
            }
        };
        return () => channel.close();
    }, []);

    const fetchUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data } = await supabase.from('organization_members').select('role').eq('organization_id', orgId).eq('user_id', user.id).single();
        if (data) setUserRole(data.role);
    };

    const fetchBrandSettings = async () => {
        const { data } = await supabase
            .from('organizations')
            .select('brand_colors')
            .eq('id', orgId)
            .single();

        if (data?.brand_colors) {
            setBrandColors(data.brand_colors);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        let query = supabase
            .from('posts')
            .select(`*, profiles:created_by (full_name, email)`)
            .eq('organization_id', orgId)
            .neq('status', 'published')
            .order('created_at', { ascending: false });
        if (userId) {
            query = query.or(`status.neq.draft,created_by.eq.${userId}`);
        }
        const { data, error } = await query;
        if (error) { console.error(error); setLoading(false); return; }
        setPosts(data || []);
        setLoading(false);
    };

    const handleApprove = async (postId) => {
        const post = posts.find(p => p.id === postId);
        const { error } = await supabase.from('posts').update({ status: 'approved' }).eq('id', postId);
        if (error) { console.error(error); return; }
        await supabase.from('activity_log').insert([{ organization_id: orgId, user_id: userId, post_id: postId, action_type: 'approve', action_text: `approved "${post?.title || 'Untitled'}"` }]);
        fetchPosts();
    };

    const handleRedo = async (postId) => {
        const post = posts.find(p => p.id === postId);
        const { error } = await supabase.from('posts').update({ status: 'draft' }).eq('id', postId);
        if (error) { console.error(error); return; }
        await supabase.from('activity_log').insert([{ organization_id: orgId, user_id: userId, post_id: postId, action_type: 'redo', action_text: `sent for redo "${post?.title || 'Untitled'}"` }]);
        fetchPosts();
    };

    const toggleSelectPost = (postId) => {
        setSelectedPosts(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
    };

    const toggleSelectAll = () => {
        if (selectedPosts.length === filteredPosts.length && filteredPosts.length > 0) {
            setSelectedPosts([]);
        } else {
            setSelectedPosts(filteredPosts.map(p => p.id));
        }
    };

    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
            const { data: oldImages } = await supabase.from('post_images').select('*').in('post_id', selectedPosts);
            if (oldImages?.length > 0) {
                const imagePaths = oldImages.map(img => img.image_path);
                await supabase.storage.from('post-images').remove(imagePaths);
            }

            // Delete dependent records first and check for errors
            const { error: notifErr } = await supabase.from('notifications').delete().in('post_id', selectedPosts);
            if (notifErr) throw new Error(`Notifications delete error: ${notifErr.message}`);

            const { error: imgErr } = await supabase.from('post_images').delete().in('post_id', selectedPosts);
            if (imgErr) throw new Error(`Images delete error: ${imgErr.message}`);

            const { error: logErr } = await supabase.from('activity_log').delete().in('post_id', selectedPosts);
            if (logErr) throw new Error(`Activity log delete error: ${logErr.message}`);

            const { error: postErr } = await supabase.from('posts').delete().in('id', selectedPosts);
            if (postErr) throw new Error(`Post delete error: ${postErr.message}`);

            await supabase.from('activity_log').insert([{ organization_id: orgId, user_id: userId, action_type: 'delete', action_text: `bulk deleted ${selectedPosts.length} posts` }]);
            setSelectedPosts([]);
            setIsDeleteModalOpen(false);
            fetchPosts();
        } catch (err) {
            console.error("Bulk Delete Error:", err);
            // Optionally, we could show this to the user via a toast notification if we had one here
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkMoveToPosted = async () => {
        try {
            const { error } = await supabase.from('posts').update({ status: 'published' }).in('id', selectedPosts);
            if (error) throw error;

            await supabase.from('activity_log').insert([{ organization_id: orgId, user_id: userId, action_type: 'approve', action_text: `bulk published ${selectedPosts.length} posts` }]);
            setSelectedPosts([]);
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || post.caption?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSocial = socialFilter === 'all' || post.social_account === socialFilter;
        const matchesPlatform = platformFilter === 'all' || post.platforms?.includes(platformFilter);
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        const matchesPostType = postTypeFilter === 'all' || post.post_type === postTypeFilter;
        return matchesSearch && matchesSocial && matchesPlatform && matchesStatus && matchesPostType;
    }).sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const selectClass = "bg-light-card py-3 px-4 rounded-2xl border border-slate-200 text-[13px] font-bold text-slate-700 outline-none cursor-pointer";

    return (
        <div className="p-10 font-sans bg-light-bg min-h-screen text-slate-900">
            {/* Controls */}
            <div className="flex flex-col gap-4 mb-8">
                {/* Row 1 */}
                <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 bg-light-card py-3 px-5 rounded-2xl border border-slate-200 flex-1 min-w-[300px]">
                    <Search size={18} color="#94a3b8" />
                    <input
                        className="border-none outline-none w-full text-sm font-medium bg-transparent text-slate-900 placeholder:text-slate-500"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <button
                    className="bg-brand text-white py-3 px-6 rounded-2xl border-none font-extrabold flex items-center gap-2.5 cursor-pointer transition-all duration-200 hover:bg-brand-hover hover:-translate-y-0.5 whitespace-nowrap"
                    onClick={() => window.open(`/org/${orgId}/posts/create`, '_blank')}
                >
                    <Plus size={20} />
                    Create Post
                </button>

                <div className="flex bg-light-card p-1 rounded-xl border border-slate-200">
                    <button
                        className={`p-2 rounded-lg border-none cursor-pointer transition-all duration-200 ${viewMode === 'grid' ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-slate-500'}`}
                        onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
                    <button
                        className={`p-2 rounded-lg border-none cursor-pointer transition-all duration-200 ${viewMode === 'list' ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-slate-500'}`}
                        onClick={() => setViewMode('list')}><List size={18} /></button>
                </div>

                {selectedPosts.length > 0 ? (
                    <div className="flex items-center gap-4 bg-brand/5 border border-brand/20 py-2.5 px-5 rounded-2xl animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center gap-2">
                            <button
                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-brand/10 text-brand cursor-pointer border-none transition-colors"
                                onClick={() => setSelectedPosts([])}
                                title="Clear selection"
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                            <span className="text-sm font-bold text-brand">{selectedPosts.length} selected</span>
                        </div>
                        <div className="w-px h-5 bg-brand/20"></div>
                        <div className="flex items-center gap-2">
                            <button
                                className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 py-1.5 px-3 rounded-lg cursor-pointer transition-colors border-none"
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                <Trash2 size={16} />
                                Delete All
                            </button>
                            <button
                                className="flex items-center gap-2 text-sm font-bold text-[#10b981] bg-[#10b981]/10 hover:bg-[#10b981]/20 py-1.5 px-3 rounded-lg cursor-pointer transition-colors border-none"
                                onClick={handleBulkMoveToPosted}
                            >
                                <CheckCircle size={16} />
                                Move to Posted
                            </button>
                        </div>
                    </div>
                ) : filteredPosts.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <input
                            type="checkbox"
                            checked={selectedPosts.length === filteredPosts.length}
                            onChange={toggleSelectAll}
                            className="w-[18px] h-[18px] cursor-pointer rounded border-[1.5px] border-slate-300 accent-brand"
                        />
                        <label className="cursor-pointer" onClick={toggleSelectAll}>Select All</label>
                    </div>
                ) : null}

                </div>

                {/* Row 2 */}
                <div className="flex gap-3 flex-wrap w-full">
                    <div className="flex-1 min-w-[140px]">
                        <CustomSelect
                            className={selectClass}
                            value={socialFilter}
                            onChange={val => setSocialFilter(val)}
                            options={[
                                { value: 'all', label: 'All Socials' },
                                { value: 'KLM', label: 'KL Main (KLM)' },
                                { value: 'KLS', label: 'KL Select (KLS)' },
                                { value: 'KLC', label: 'KL Community (KLC)' }
                            ]}
                        />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <CustomSelect
                            className={selectClass}
                            value={platformFilter}
                            onChange={val => setPlatformFilter(val)}
                            options={[
                                { value: 'all', label: 'All Platforms' },
                                { value: 'Instagram', label: 'Instagram' },
                                { value: 'LinkedIn', label: 'LinkedIn' },
                                { value: 'YouTube', label: 'YouTube' }
                            ]}
                        />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <CustomSelect
                            className={selectClass}
                            value={statusFilter}
                            onChange={val => setStatusFilter(val)}
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'draft', label: 'Draft' },
                                { value: 'pending review', label: 'Pending Review' },
                                { value: 'approved', label: 'Approved' }
                            ]}
                        />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <CustomSelect
                            className={selectClass}
                            value={postTypeFilter}
                            onChange={val => setPostTypeFilter(val)}
                            options={[
                                { value: 'all', label: 'All Types' },
                                { value: 'reel', label: 'Reel' },
                                { value: 'story', label: 'Story' },
                                { value: 'carousel', label: 'Carousel' }
                            ]}
                        />
                    </div>

                    <div className="flex-1 min-w-[180px]">
                        <CustomSelect
                            className={selectClass}
                            value={sortOrder}
                            onChange={val => setSortOrder(val)}
                            options={[
                                { value: 'desc', label: 'Sort by date: Descending' },
                                { value: 'asc', label: 'Sort by date: Ascending' }
                            ]}
                        />
                    </div>

                    <button
                        className="bg-[#059669] hover:bg-[#047857] text-white text-[13px] font-extrabold py-3 px-5 rounded-2xl cursor-pointer transition-all duration-200 border-none shadow-[0_4px_12px_rgba(5,150,105,0.3)] hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                        onClick={() => navigate(`/org/${orgId}/done-posting`)}
                    >
                        Published
                    </button>
                </div>
            </div>

            {/* Posts */}
            {loading ? (
                <div className="text-center py-24 text-brand font-bold">Loading posts...</div>
            ) : filteredPosts.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6' : 'flex flex-col gap-3'}>
                    {filteredPosts.map(post =>
                        viewMode === 'grid' ? (
                            <PostCard key={post.id} post={post} userRole={userRole} currentUserId={userId} orgId={orgId} onApprove={handleApprove} onRedo={handleRedo} isSelected={selectedPosts.includes(post.id)} onSelect={() => toggleSelectPost(post.id)} brandColors={brandColors} />
                        ) : (
                            <PostListRow key={post.id} post={post} userRole={userRole} currentUserId={userId} orgId={orgId} onApprove={handleApprove} onRedo={handleRedo} isSelected={selectedPosts.includes(post.id)} onSelect={() => toggleSelectPost(post.id)} brandColors={brandColors} />
                        )
                    )}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-semibold">No posts found.</p>
                </div>
            )}

            <DeletePostModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleBulkDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default Posts;