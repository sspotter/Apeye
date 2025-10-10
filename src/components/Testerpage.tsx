import { useState, useMemo, useEffect } from 'react';
import { Plus, ExternalLink, Edit2, Trash2, Search, X, Folder, Globe, Loader2, Sparkles, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateProductInfo } from '../lib/gemini';

interface Resource {
  id: string;
  category_id: string;
  name: string;
  url: string;
  description: string;
  user_id: string;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at?: string;
  resources?: Resource[];
}

export function Testerpage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    category: '',
    newCategory: '',
    name: '',
    url: '',
    description: '',
  });

  // Fetch categories and resources from Supabase
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('resource_categories')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });

      if (resourcesError) throw resourcesError;

      setCategories(categoriesData || []);
      setResources(resourcesData || []);
      
      // Set first category as active if exists
      if (categoriesData && categoriesData.length > 0 && !activeTab) {
        setActiveTab(categoriesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get resources for active category with search filter
  const filteredResources = useMemo(() => {
    if (!activeTab) return [];
    
    const categoryResources = resources.filter(r => r.category_id === activeTab);
    
    if (!searchQuery.trim()) return categoryResources;

    const query = searchQuery.toLowerCase();
    return categoryResources.filter(
      (resource) =>
        resource.name.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query)
    );
  }, [resources, activeTab, searchQuery]);

  // Get resource count for each category
  const getCategoryCount = (categoryId: string) => {
    return resources.filter(r => r.category_id === categoryId).length;
  };

  const switchTab = (categoryId: string) => {
    setActiveTab(categoryId);
    setSearchQuery(''); // Clear search when switching tabs
  };

  const toggleResourceExpanded = (resourceId: string) => {
    setExpandedResources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  const openAddModal = () => {
    setEditingResource(null);
    setFormData({
      category: activeTab || categories[0]?.id || '',
      newCategory: '',
      name: '',
      url: '',
      description: '',
    });
    setShowModal(true);
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      category: resource.category_id,
      newCategory: '',
      name: resource.name,
      url: resource.url,
      description: resource.description,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingResource(null);
    setFormData({
      category: '',
      newCategory: '',
      name: '',
      url: '',
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let targetCategoryId = formData.category;

      // Create new category if specified
      if (formData.newCategory.trim()) {
        const { data: newCategory, error: categoryError } = await supabase
          .from('resource_categories')
          .insert({
            name: formData.newCategory.trim(),
            user_id: user!.id,
          })
          .select()
          .single();

        if (categoryError) throw categoryError;
        targetCategoryId = newCategory.id;
      }

      if (editingResource) {
        // Update existing resource
        const { error } = await supabase
          .from('resources')
          .update({
            name: formData.name,
            url: formData.url,
            description: formData.description,
            category_id: targetCategoryId,
          })
          .eq('id', editingResource.id);

        if (error) throw error;
      } else {
        // Create new resource
        const { error } = await supabase
          .from('resources')
          .insert({
            name: formData.name,
            url: formData.url,
            description: formData.description,
            category_id: targetCategoryId,
            user_id: user!.id,
          });

        if (error) throw error;
      }

      // Refresh data
      await fetchData();
      
      // Switch to the target category if new category was created
      if (formData.newCategory.trim()) {
        setActiveTab(targetCategoryId);
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Failed to save resource. Please try again.');
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource. Please try again.');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const count = getCategoryCount(categoryId);
    if (count > 0) {
      if (!confirm(`This category has ${count} resource(s). Delete anyway?`)) return;
    } else {
      if (!confirm('Are you sure you want to delete this category?')) return;
    }

    try {
      // Delete all resources in category first
      const { error: resourcesError } = await supabase
        .from('resources')
        .delete()
        .eq('category_id', categoryId);

      if (resourcesError) throw resourcesError;

      // Delete category
      const { error: categoryError } = await supabase
        .from('resource_categories')
        .delete()
        .eq('id', categoryId);

      if (categoryError) throw categoryError;

      // Switch to first available category
      const remainingCategories = categories.filter(c => c.id !== categoryId);
      if (remainingCategories.length > 0) {
        setActiveTab(remainingCategories[0].id);
      } else {
        setActiveTab(null);
      }

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const handleAutoFill = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a website name first');
      return;
    }

    setAutoFilling(true);

    try {
      const productInfo = await generateProductInfo(formData.name);
      
      setFormData({
        ...formData,
        url: productInfo.url,
        description: productInfo.description,
      });
    } catch (error) {
      console.error('Error auto-filling:', error);
      alert(error instanceof Error ? error.message : 'Failed to auto-fill. Please try again.');
    } finally {
      setAutoFilling(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a website name first');
      return;
    }

    setGeneratingDescription(true);

    try {
      // Get full product info and extract only description
      const productInfo = await generateProductInfo(formData.name);
      
      setFormData({ ...formData, description: productInfo.description });
    } catch (error) {
      console.error('Error generating description:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate description. Please try again.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin theme-text-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">Resource Library</h1>
            <p className="theme-text-secondary">Organize and access your favorite web resources</p>
          </div>
          <button
            onClick={openAddModal}
            disabled={categories.length === 0}
            className="flex items-center gap-2 px-4 py-2 theme-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:animate-bounce-smoothhg"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Resource</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="theme-bg-secondary theme-border border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="theme-accent p-2 rounded-lg">
                <Folder className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold theme-text-primary">{categories.length}</p>
                <p className="text-sm theme-text-secondary">Categories</p>
              </div>
            </div>
          </div>
          <div className="theme-bg-secondary theme-border border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="theme-accent p-2 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold theme-text-primary">{resources.length}</p>
                <p className="text-sm theme-text-secondary">Resources</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 theme-bg-secondary theme-border border rounded-xl">
          <Folder className="w-12 h-12 theme-text-tertiary mx-auto mb-3" />
          <p className="theme-text-secondary mb-4">No categories yet. Create your first category!</p>
          <button
            onClick={() => {
              setFormData({
                category: '',
                newCategory: '',
                name: '',
                url: '',
                description: '',
              });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 theme-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create Category & Add Resource
          </button>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Sidebar with Category Tabs */}
          <div className="w-64 flex-shrink-0">
            <div className="theme-bg-secondary theme-border border rounded-xl p-3 sticky top-4">
              <h3 className="text-sm font-semibold theme-text-secondary uppercase tracking-wide px-3 mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => switchTab(category.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between group ${
                      activeTab === category.id
                        ? 'theme-accent text-white'
                        : 'theme-text-primary hover:theme-bg-tertiary'
                    }`}
                  >
                    <span className="font-medium truncate">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          activeTab === category.id
                            ? 'bg-white/20 text-white'
                            : 'theme-bg-tertiary theme-text-tertiary'
                        }`}
                      >
                        {getCategoryCount(category.id)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(category.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                          activeTab === category.id
                            ? 'hover:bg-white/20 text-white'
                            : 'hover:bg-red-100 text-red-500'
                        }`}
                        title="Delete category"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab && (
              <>
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search resources in this category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 theme-bg-secondary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                    title='Clear search'
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-tertiary hover:theme-text-secondary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Resources Grid */}
                {filteredResources.length === 0 ? (
                  <div className="text-center py-12 theme-bg-secondary theme-border border rounded-xl">
                    <Globe className="w-12 h-12 theme-text-tertiary mx-auto mb-3" />
                    <p className="theme-text-secondary">
                      {searchQuery
                        ? 'No resources found matching your search'
                        : 'No resources in this category yet. Add your first one!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredResources.map((resource) => {
                      const isExpanded = expandedResources.has(resource.id);
                      return (
                        <div
                          key={resource.id}
                          className="theme-bg-secondary theme-border border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {/* Collapsed Header - Always Visible */}
                          <button
                            onClick={() => toggleResourceExpanded(resource.id)}
                            className="w-full flex items-center gap-4 p-5 hover:theme-bg-tertiary transition-colors text-left"
                          >
                            {/* Favicon */}
                            <div className="flex-shrink-0">
                              {getFavicon(resource.url) ? (
                                <img
                                  src={getFavicon(resource.url)!}
                                  alt=""
                                  className="w-8 h-8 rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Globe className="w-8 h-8 theme-text-tertiary" />
                              )}
                            </div>

                            {/* Title */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold theme-text-primary truncate">
                                {resource.name}
                              </h4>
                            </div>

                            {/* Expand/Collapse Icon */}
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 theme-text-secondary" />
                              ) : (
                                <ChevronDown className="w-5 h-5 theme-text-secondary" />
                              )}
                            </div>
                          </button>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-5 space-y-3">
                              {/* Description */}
                              <p className="text-sm theme-text-secondary">{resource.description}</p>
                              
                              {/* URL */}
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm theme-text-tertiary hover:text-blue-500 transition-colors group"
                              >
                                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{resource.url}</span>
                              </a>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-2">
                                <button
                                  onClick={() => openEditModal(resource)}
                                  className="flex items-center gap-2 px-4 py-2 theme-text-secondary hover:theme-text-primary hover:theme-bg-tertiary rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  <span className="text-sm font-medium">Edit</span>
                                </button>
                                <button
                                  onClick={() => deleteResource(resource.id)}
                                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="text-sm font-medium">Delete</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="theme-bg-secondary theme-border border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 theme-bg-secondary theme-border border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold theme-text-primary">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h2>
              <button
                onClick={closeModal}
                className="theme-text-secondary hover:theme-text-primary transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Category
                </label>
                <select
                title='Select a category'
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 theme-bg-tertiary theme-border border rounded-lg theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!formData.newCategory.trim()}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* New Category */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Or Create New Category
                </label>
                <input
                title='Enter new category name'
                  type="text"
                  value={formData.newCategory}
                  onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                  placeholder="Enter new category name"
                  className="w-full px-4 py-2 theme-bg-tertiary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Resource Name */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Website Name *
                </label>
                <input
                title='Enter website name'
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Tailwind CSS"
                  className="w-full px-4 py-2 theme-bg-tertiary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* AI Generation Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={!formData.name.trim() || autoFilling}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  title="Auto-fill URL and description using AI"
                >
                  {autoFilling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Auto-filling...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>✨ Auto-fill All</span>
                    </>
                  )}
                </button>
              </div>
              {/* URL */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 theme-bg-tertiary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description - Collapsible */}
              <div className="theme-bg-tertiary theme-border border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:theme-bg-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isDescriptionExpanded ? (
                      <ChevronUp className="w-5 h-5 theme-text-secondary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 theme-text-secondary" />
                    )}
                    <label className="text-sm font-medium theme-text-secondary cursor-pointer">
                      Description * {formData.description && `(${formData.description.length} chars)`}
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateDescription();
                    }}
                    disabled={!formData.name.trim() || generatingDescription}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    title="Generate description only using AI"
                  >
                    {generatingDescription ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </button>
                
                {isDescriptionExpanded && (
                  <div className="px-4 pb-4">
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the resource"
                      rows={4}
                      className="w-full px-4 py-3 theme-bg-primary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      required
                      disabled={generatingDescription}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 theme-bg-tertiary theme-text-secondary font-medium rounded-lg hover:theme-bg-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 theme-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingResource ? 'Save Changes' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
