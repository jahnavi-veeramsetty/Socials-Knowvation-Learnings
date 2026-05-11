import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
    Search,
    Plus,
    LayoutGrid,
    List,
} from 'lucide-react';

import { supabase } from '../supabase/supabase';

import PostCard from '../components/posts/PostCard';
import PostListRow from '../components/posts/PostListRow';

const Posts = () => {

    const { orgId } = useParams();

    const [viewMode, setViewMode] =
        useState('grid');

    const [posts, setPosts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [userRole, setUserRole] =
        useState('member');

    const [userId, setUserId] =
        useState(null);

    const [searchQuery, setSearchQuery] =
        useState('');

    const [socialFilter, setSocialFilter] =
        useState('all');

    const [platformFilter, setPlatformFilter] =
        useState('all');

    const [statusFilter, setStatusFilter] =
        useState('all');

    useEffect(() => {

        fetchUserRole();

    }, [orgId]);

    useEffect(() => {

        if (userId) {
            fetchPosts();
        }

    }, [userId, orgId]);

    const fetchUserRole = async () => {

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        setUserId(user.id);

        const { data } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', orgId)
            .eq('user_id', user.id)
            .single();

        if (data) {
            setUserRole(data.role);
        }
    };

    const fetchPosts = async () => {

        setLoading(true);

        let query = supabase
            .from('posts')
            .select(`
                *,
                profiles:created_by (
                    full_name,
                    email
                )
            `)
            .eq('organization_id', orgId)
            .order('created_at', {
                ascending: false,
            });

        // MEMBERS:
        // drafts only visible to creator

        if (
            userRole !== 'owner' &&
            userRole !== 'admin'
        ) {

            query = query.or(
                `status.neq.draft,created_by.eq.${userId}`
            );
        }

        const { data, error } =
            await query;

        if (error) {

            console.error(error);

            setLoading(false);

            return;
        }

        setPosts(data || []);

        setLoading(false);
    };

    const handleApprove = async (
        postId
    ) => {

        const post = posts.find(
            (p) => p.id === postId
        );

        const { error } = await supabase
            .from('posts')
            .update({
                status: 'approved',
            })
            .eq('id', postId);

        if (error) {

            console.error(error);

            return;
        }

        await supabase
            .from('activity_log')
            .insert([
                {
                    organization_id: orgId,
                    user_id: userId,
                    post_id: postId,
                    action_type: 'approve',
                    action_text: `approved "${post?.title || 'Untitled'}"`
                }
            ]);

        fetchPosts();
    };

    const handleReject = async (postId) => {
        const post = posts.find(p => p.id === postId);
        const { error } = await supabase
            .from('posts')
            .update({ status: 'draft' })
            .eq('id', postId);

        if (error) {
            console.error(error);
            return;
        }

        await supabase.from('activity_log').insert([{
            organization_id: orgId,
            user_id: userId,
            post_id: postId,
            action_type: 'reject',
            action_text: `rejected "${post?.title || 'Untitled'}"`
        }]);

        fetchPosts();
    };

    const filteredPosts = posts.filter(
        (post) => {

            const matchesSearch =
                post.title
                    ?.toLowerCase()
                    .includes(
                        searchQuery.toLowerCase()
                    ) ||
                post.caption
                    ?.toLowerCase()
                    .includes(
                        searchQuery.toLowerCase()
                    );

            const matchesSocial =
                socialFilter === 'all' ||
                post.social_account ===
                socialFilter;

            const matchesPlatform =
                platformFilter === 'all' ||
                post.platforms?.includes(
                    platformFilter
                );

            const matchesStatus =
                statusFilter === 'all' ||
                post.status ===
                statusFilter;

            return (
                matchesSearch &&
                matchesSocial &&
                matchesPlatform &&
                matchesStatus
            );
        }
    );

    return (
        <div className="posts-page">

            <style>{`
                .posts-page {
                    padding: 40px;
                    font-family: 'Inter', sans-serif;
                    background: #010D2C;
                    min-height: 100vh;
                    color: #ffffff;
                }

                .posts-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }

                .posts-header h1 {
                    color: #ffffff;
                    font-size: 32px;
                    font-weight: 800;
                    margin: 0;
                }

                .controls-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #0a1936;
                    padding: 12px 20px;
                    border-radius: 14px;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    flex: 1;
                    min-width: 300px;
                }

                .search-bar input {
                    border: none;
                    outline: none;
                    width: 100%;
                    font-size: 14px;
                    font-weight: 500;
                    background: transparent;
                    color: white;
                }

                .filters-group {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .filter-select {
                    background: #0a1936;
                    padding: 12px 16px;
                    border-radius: 14px;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    font-size: 13px;
                    font-weight: 700;
                    color: #cbd5e1;
                    outline: none;
                    cursor: pointer;
                }

                .view-toggle {
                    display: flex;
                    background: #0a1936;
                    padding: 4px;
                    border-radius: 12px;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                }

                .toggle-btn {
                    padding: 8px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .toggle-btn.active {
                    background: #002B72;
                    color: white;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .create-btn {
                    background: #002B72;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 14px;
                    border: none;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .create-btn:hover {
                    background: #001f54;
                    transform: translateY(-2px);
                }

                .posts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                }

                .posts-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                @media (max-width: 1024px) {
                    .controls-row {
                        flex-direction: column;
                        align-items: stretch;
                    }
                }
            `}</style>

            <div className="posts-header">

                <div>
                    <h1>Posts</h1>

                    <p
                        style={{
                            color: '#666',
                            margin: '4px 0 0',
                        }}
                    >
                        Manage and schedule your
                        content
                    </p>
                </div>

                <button
                    className="create-btn"
                    onClick={() =>
                        window.open(
                            `/org/${orgId}/posts/create`,
                            '_blank'
                        )
                    }
                >
                    <Plus size={20} />
                    Create Post
                </button>
            </div>

            <div className="controls-row">

                <div className="search-bar">

                    <Search
                        size={18}
                        color="#94a3b8"
                    />

                    <input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) =>
                            setSearchQuery(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="filters-group">

                    <select
                        className="filter-select"
                        value={socialFilter}
                        onChange={(e) =>
                            setSocialFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Socials
                        </option>

                        <option value="KLM">
                            KL Main (KLM)
                        </option>

                        <option value="KLS">
                            KL Select (KLS)
                        </option>

                        <option value="KLC">
                            KL Community (KLC)
                        </option>
                    </select>

                    <select
                        className="filter-select"
                        value={platformFilter}
                        onChange={(e) =>
                            setPlatformFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Platforms
                        </option>

                        <option value="Instagram">
                            Instagram
                        </option>

                        <option value="LinkedIn">
                            LinkedIn
                        </option>

                        <option value="YouTube">
                            YouTube
                        </option>
                    </select>

                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Status
                        </option>

                        <option value="draft">
                            Draft
                        </option>

                        <option value="pending review">
                            Pending Review
                        </option>

                        <option value="approved">
                            Approved
                        </option>

                        <option value="published">
                            Published
                        </option>
                    </select>

                    <div className="view-toggle">

                        <button
                            className={`toggle-btn ${viewMode ===
                                'grid'
                                ? 'active'
                                : ''
                                }`}
                            onClick={() =>
                                setViewMode(
                                    'grid'
                                )
                            }
                        >
                            <LayoutGrid
                                size={18}
                            />
                        </button>

                        <button
                            className={`toggle-btn ${viewMode ===
                                'list'
                                ? 'active'
                                : ''
                                }`}
                            onClick={() =>
                                setViewMode(
                                    'list'
                                )
                            }
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (

                <div
                    style={{
                        textAlign: 'center',
                        padding: '100px',
                        color: '#002B72',
                    }}
                >
                    Loading posts...
                </div>

            ) : filteredPosts.length > 0 ? (

                <div
                    className={
                        viewMode === 'grid'
                            ? 'posts-grid'
                            : 'posts-list'
                    }
                >

                    {filteredPosts.map(
                        (post) =>
                            viewMode ===
                                'grid' ? (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    userRole={userRole}
                                    currentUserId={userId}
                                    orgId={orgId}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                />
                            ) : (
                                <PostListRow
                                    key={post.id}
                                    post={post}
                                    userRole={userRole}
                                    currentUserId={userId}
                                    orgId={orgId}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                />
                            )
                    )}
                </div>

            ) : (

                <div
                    style={{
                        textAlign: 'center',
                        padding: '100px',
                        background: 'white',
                        borderRadius: '24px',
                        border:
                            '1.5px dashed #e2e8f0',
                    }}
                >
                    <p
                        style={{
                            color: '#64748b',
                            fontWeight: 600,
                        }}
                    >
                        No posts found.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Posts;