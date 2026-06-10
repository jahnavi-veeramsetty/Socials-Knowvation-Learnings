import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, Trash2, ArrowLeft, X } from 'lucide-react';
import { supabase } from '../supabase/supabase';
import CustomSelect from '../components/common/CustomSelect';
import DeleteBlogModal from '../components/blogs/DeleteBlogModal';
import BlogCard from '../components/blogs/BlogCard';
import BlogListRow from '../components/blogs/BlogListRow';

const DoneBlogs = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('member');
    const [userId, setUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [authorFilter, setAuthorFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedBlogs, setSelectedBlogs] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => { fetchUserRole(); }, [orgId]);
    useEffect(() => { if (userId) { fetchBlogs(); } }, [userId, orgId, refreshTrigger]);

    useEffect(() => {
        const channel = new BroadcastChannel('blogs_channel');
        channel.onmessage = (event) => {
            if (event.data === 'refresh_blogs') {
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

    const fetchBlogs = async () => {
        setLoading(true);
        let query = supabase
            .from('blogs')
            .select(`*, profiles:created_by (full_name, email)`)
            .eq('organization_id', orgId)
            .eq('status', 'published') // Only fetch published blogs
            .order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) { console.error(error); setLoading(false); return; }
        setBlogs(data || []);
        setLoading(false);
    };

    const toggleSelectBlog = (blogId) => {
        setSelectedBlogs(prev => prev.includes(blogId) ? prev.filter(id => id !== blogId) : [...prev, blogId]);
    };

    const toggleSelectAll = () => {
        if (selectedBlogs.length === filteredBlogs.length && filteredBlogs.length > 0) {
            setSelectedBlogs([]);
        } else {
            setSelectedBlogs(filteredBlogs.map(b => b.id));
        }
    };

    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
            const { data: oldImages } = await supabase.from('blog_images').select('*').in('blog_id', selectedBlogs);
            if (oldImages?.length > 0) {
                const imagePaths = oldImages.map(img => img.image_path);
                await supabase.storage.from('blog-images').remove(imagePaths);
            }

            const { error: notifErr } = await supabase.from('notifications').delete().in('blog_id', selectedBlogs);
            if (notifErr) throw new Error(`Notifications delete error: ${notifErr.message}`);

            const { error: imgErr } = await supabase.from('blog_images').delete().in('blog_id', selectedBlogs);
            if (imgErr) throw new Error(`Images delete error: ${imgErr.message}`);

            const { error: logErr } = await supabase.from('activity_log').delete().in('blog_id', selectedBlogs);
            if (logErr) throw new Error(`Activity log delete error: ${logErr.message}`);

            const { error: blogErr } = await supabase.from('blogs').delete().in('id', selectedBlogs);
            if (blogErr) throw new Error(`Blog delete error: ${blogErr.message}`);

            await supabase.from('activity_log').insert([{ organization_id: orgId, user_id: userId, action_type: 'delete', action_text: `bulk deleted ${selectedBlogs.length} published blogs` }]);
            setSelectedBlogs([]);
            setIsDeleteModalOpen(false);
            fetchBlogs();
        } catch (err) {
            console.error("Bulk Delete Error:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const uniqueAuthors = Array.from(new Set(blogs.map(b => b.created_by)))
        .filter(id => id != null)
        .map(id => {
            const blog = blogs.find(b => b.created_by === id);
            return {
                value: id,
                label: blog.profiles?.full_name || blog.profiles?.email || 'Unknown'
            };
        });

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) || blog.content?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAuthor = authorFilter === 'all' || blog.created_by === authorFilter;
        return matchesSearch && matchesAuthor;
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
                    <h1 className="text-slate-900 text-[32px] font-extrabold m-0">Published Blogs</h1>
                    <p className="text-slate-500 mt-1 mb-0">View your published blogs</p>
                </div>
                <button
                    className="bg-white text-slate-700 py-3 px-6 rounded-2xl border border-slate-200 font-extrabold flex items-center gap-2.5 cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:-translate-y-0.5"
                    onClick={() => navigate(`/org/${orgId}/blogs`)}
                >
                    <ArrowLeft size={20} />
                    Back to Blogs
                </button>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center gap-4 mb-8 flex-wrap">
                <div className="flex items-center gap-3 bg-light-card py-3 px-5 rounded-2xl border border-slate-200 flex-1 min-w-[300px]">
                    <Search size={18} color="#94a3b8" />
                    <input
                        className="border-none outline-none w-full text-sm font-medium bg-transparent text-slate-900 placeholder:text-slate-500"
                        placeholder="Search published blogs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    {selectedBlogs.length > 0 ? (
                        <div className="flex items-center gap-4 bg-brand/5 border border-brand/20 py-2.5 px-5 rounded-2xl animate-[fadeIn_0.2s_ease-out]">
                            <div className="flex items-center gap-2">
                                <button
                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-brand/10 text-brand cursor-pointer border-none transition-colors"
                                    onClick={() => setSelectedBlogs([])}
                                    title="Clear selection"
                                >
                                    <X size={14} strokeWidth={3} />
                                </button>
                                <span className="text-sm font-bold text-brand">{selectedBlogs.length} selected</span>
                            </div>
                            <div className="w-px h-5 bg-brand/20"></div>
                            <button
                                className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 py-1.5 px-3 rounded-lg cursor-pointer transition-colors border-none"
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                <Trash2 size={16} />
                                Delete Selected
                            </button>
                        </div>
                    ) : filteredBlogs.length > 0 ? (
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                            <input
                                type="checkbox"
                                checked={selectedBlogs.length === filteredBlogs.length}
                                onChange={toggleSelectAll}
                                className="w-[18px] h-[18px] cursor-pointer rounded border-[1.5px] border-slate-300 accent-brand"
                            />
                            <label className="cursor-pointer" onClick={toggleSelectAll}>Select All</label>
                        </div>
                    ) : null}

                    <div className="flex gap-3 flex-wrap">
                        <div className="w-[160px]">
                            <CustomSelect
                                className={selectClass}
                                value={authorFilter}
                                onChange={val => setAuthorFilter(val)}
                                options={[
                                    { value: 'all', label: 'All Authors' },
                                    ...uniqueAuthors
                                ]}
                            />
                        </div>

                        <div className="w-[220px]">
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

                        <div className="flex bg-light-card p-1 rounded-xl border border-slate-200">
                            <button
                                className={`p-2 rounded-lg border-none cursor-pointer transition-all duration-200 ${viewMode === 'grid' ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-slate-500'}`}
                                onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
                            <button
                                className={`p-2 rounded-lg border-none cursor-pointer transition-all duration-200 ${viewMode === 'list' ? 'bg-brand text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'bg-transparent text-slate-500'}`}
                                onClick={() => setViewMode('list')}><List size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blogs */}
            {loading ? (
                <div className="text-center py-24 text-brand font-bold">Loading blogs...</div>
            ) : filteredBlogs.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6' : 'flex flex-col gap-3'}>
                    {filteredBlogs.map(blog =>
                        viewMode === 'grid' ? (
                            <BlogCard key={blog.id} blog={blog} userRole={userRole} currentUserId={userId} orgId={orgId} isSelected={selectedBlogs.includes(blog.id)} onSelect={() => toggleSelectBlog(blog.id)} />
                        ) : (
                            <BlogListRow key={blog.id} blog={blog} userRole={userRole} currentUserId={userId} orgId={orgId} isSelected={selectedBlogs.includes(blog.id)} onSelect={() => toggleSelectBlog(blog.id)} />
                        )
                    )}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-semibold">No published blogs found.</p>
                </div>
            )}

            <DeleteBlogModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleBulkDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default DoneBlogs;
