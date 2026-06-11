import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, Trash2, ArrowLeft, X } from 'lucide-react';
import { supabase } from '../supabase/supabase';
import CustomSelect from '../components/common/CustomSelect';
import DeletePostModal from '../components/posts/DeletePostModal';
import PostCard from '../components/posts/PostCard';
import PostListRow from '../components/posts/PostListRow';
import BlogCard from '../components/blogs/BlogCard';
import BlogListRow from '../components/blogs/BlogListRow';

const Published = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('member');
    const [userId, setUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedItems, setSelectedItems] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => { fetchUserRole(); }, [orgId]);
    useEffect(() => { if (userId) { fetchPublishedContent(); } }, [userId, orgId, refreshTrigger]);

    useEffect(() => {
        const channel = new BroadcastChannel('published_channel');
        channel.onmessage = (event) => {
            if (event.data === 'refresh_published' || event.data === 'refresh_posts' || event.data === 'refresh_blogs') {
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

    const fetchPublishedContent = async () => {
        setLoading(true);
        try {
            const [postsRes, blogsRes] = await Promise.all([
                supabase.from('posts').select(`*, profiles:created_by (full_name, email)`).eq('organization_id', orgId).eq('status', 'published'),
                supabase.from('blogs').select(`*, profiles:created_by (full_name, email)`).eq('organization_id', orgId).eq('status', 'published')
            ]);

            const fetchedPosts = (postsRes.data || []).map(p => ({ ...p, itemType: p.post_type || 'post' }));
            const fetchedBlogs = (blogsRes.data || []).map(b => ({ ...b, itemType: 'blog' }));

            setItems([...fetchedPosts, ...fetchedBlogs]);
        } catch (error) {
            console.error('Error fetching published content:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectItem = (itemId) => {
        setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === filteredItems.length && filteredItems.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredItems.map(item => `${item.itemType === 'blog' ? 'blog' : 'post'}-${item.id}`));
        }
    };

    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
            const postIds = selectedItems.filter(id => id.startsWith('post-')).map(id => id.replace('post-', ''));
            const blogIds = selectedItems.filter(id => id.startsWith('blog-')).map(id => id.replace('blog-', ''));

            if (postIds.length > 0) {
                const { data: oldImages } = await supabase.from('post_images').select('*').in('post_id', postIds);
                if (oldImages?.length > 0) {
                    const imagePaths = oldImages.map(img => img.image_path);
                    await supabase.storage.from('post-images').remove(imagePaths);
                }
                await supabase.from('posts').delete().in('id', postIds);
            }

            if (blogIds.length > 0) {
                const { data: oldImages } = await supabase.from('blog_images').select('*').in('blog_id', blogIds);
                if (oldImages?.length > 0) {
                    const imagePaths = oldImages.map(img => img.image_path);
                    await supabase.storage.from('blog-images').remove(imagePaths);
                }
                await supabase.from('notifications').delete().in('blog_id', blogIds);
                await supabase.from('blog_images').delete().in('blog_id', blogIds);
                await supabase.from('activity_log').delete().in('blog_id', blogIds);
                await supabase.from('blogs').delete().in('id', blogIds);
            }

            await supabase.from('activity_log').insert([{ organization_id: orgId, user_id: userId, action_type: 'delete', action_text: `bulk deleted ${selectedItems.length} published items` }]);
            setSelectedItems([]);
            setIsDeleteModalOpen(false);
            fetchPublishedContent();
        } catch (err) {
            console.error("Bulk Delete Error:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredItems = items.filter(item => {
        const title = item.title || '';
        const desc = item.caption || item.content || '';
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || item.itemType === typeFilter;
        return matchesSearch && matchesType;
    }).sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const selectClass = "bg-light-card py-3 px-4 rounded-2xl border border-slate-200 text-[13px] font-bold text-slate-700 outline-none cursor-pointer";

    return (
        <div className="p-10 font-sans bg-light-bg min-h-screen text-slate-900">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-slate-900 text-[32px] font-extrabold m-0">Published Content</h1>
                    <p className="text-slate-500 mt-1 mb-0">View all your published carousels, reels, and blogs</p>
                </div>
                <button
                    className="bg-white text-slate-700 py-3 px-6 rounded-2xl border border-slate-200 font-extrabold flex items-center gap-2.5 cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:-translate-y-0.5"
                    onClick={() => navigate(`/org/${orgId}/dashboard`)}
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-3 bg-light-card py-3 px-5 rounded-2xl border border-slate-200 flex-1 min-w-[300px]">
                        <Search size={18} color="#94a3b8" />
                        <input
                            className="border-none outline-none w-full text-sm font-medium bg-transparent text-slate-900 placeholder:text-slate-500"
                            placeholder="Search published content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex bg-light-card p-1 rounded-xl border border-slate-200">
                        <button
                            className={`p-2 rounded-lg border-none cursor-pointer transition-all duration-200 ${viewMode === 'grid' ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-slate-500'}`}
                            onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
                        <button
                            className={`p-2 rounded-lg border-none cursor-pointer transition-all duration-200 ${viewMode === 'list' ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-slate-500'}`}
                            onClick={() => setViewMode('list')}><List size={18} /></button>
                    </div>

                    {filteredItems.length > 0 && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 ml-2">
                            <input
                                type="checkbox"
                                checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                                onChange={toggleSelectAll}
                                className="w-[18px] h-[18px] cursor-pointer rounded border-[1.5px] border-slate-300 accent-brand"
                            />
                            <label className="cursor-pointer select-none" onClick={toggleSelectAll}>Select All</label>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 flex-wrap w-full">
                    <div className="flex-1 min-w-[140px]">
                        <CustomSelect
                            className={selectClass}
                            value={typeFilter}
                            onChange={val => setTypeFilter(val)}
                            options={[
                                { value: 'all', label: 'All Types' },
                                { value: 'carousel', label: 'Carousels' },
                                { value: 'reel', label: 'Reels' },
                                { value: 'blog', label: 'Blogs' }
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
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedItems.length > 0 && (
                <div className="flex items-center justify-between bg-brand/5 border border-brand/20 rounded-2xl p-4 mb-6 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center gap-4">
                        <div className="bg-white text-brand font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                            {selectedItems.length}
                        </div>
                        <span className="text-slate-700 font-bold">Items Selected</span>
                        <button
                            className="text-sm font-semibold text-slate-500 hover:text-slate-700 underline underline-offset-2 ml-2 border-none bg-transparent cursor-pointer"
                            onClick={() => setSelectedItems([])}
                        >
                            Clear Selection
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center gap-2 text-sm font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 py-2 px-4 rounded-xl cursor-pointer transition-colors shadow-sm"
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            <Trash2 size={16} />
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Items */}
            {loading ? (
                <div className="text-center py-24 text-brand font-bold">Loading content...</div>
            ) : filteredItems.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6' : 'flex flex-col gap-3'}>
                    {filteredItems.map(item => {
                        const idKey = item.itemType === 'blog' ? `blog-${item.id}` : `post-${item.id}`;
                        const isSelected = selectedItems.includes(idKey);
                        const onSelect = () => toggleSelectItem(idKey);

                        if (item.itemType === 'blog') {
                            return viewMode === 'grid' ? (
                                <BlogCard key={idKey} blog={item} userRole={userRole} currentUserId={userId} orgId={orgId} isSelected={isSelected} onSelect={onSelect} />
                            ) : (
                                <BlogListRow key={idKey} blog={item} userRole={userRole} currentUserId={userId} orgId={orgId} isSelected={isSelected} onSelect={onSelect} />
                            );
                        } else {
                            return viewMode === 'grid' ? (
                                <PostCard key={idKey} post={item} userRole={userRole} currentUserId={userId} orgId={orgId} isSelected={isSelected} onSelect={onSelect} />
                            ) : (
                                <PostListRow key={idKey} post={item} userRole={userRole} currentUserId={userId} orgId={orgId} isSelected={isSelected} onSelect={onSelect} />
                            );
                        }
                    })}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-semibold">No published content found.</p>
                </div>
            )}

            {/* We reuse DeletePostModal for generic deletion confirmation */}
            <DeletePostModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleBulkDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default Published;
