import { useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronRight, ExternalLink, Edit2, Trash2, Search, X, Folder, Globe } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  url: string;
  description: string;
  favicon?: string;
}

interface Category {
  id: string;
  name: string;
  resources: Resource[];
}

// const initialCategories: Category[] = [
//   {
//     id: '1',
//     name: 'CSS Tools',
//     resources: [
//       {
//         id: '1-1',
//         name: 'Tailwind CSS',
//         url: 'https://tailwindcss.com',
//         description: 'A utility-first CSS framework for rapid UI development',
//       },
//       {
//         id: '1-2',
//         name: 'CSS Gradient',
//         url: 'https://cssgradient.io',
//         description: 'Free tool to create beautiful CSS gradients',
//       },
//     ],
//   },
//   {
//     id: '2',
//     name: 'Mockups',
//     resources: [
//       {
//         id: '2-1',
//         name: 'Figma',
//         url: 'https://figma.com',
//         description: 'Collaborative interface design tool',
//       },
//     ],
//   },
//   {
//     id: '3',
//     name: '3D Models',
//     resources: [
//       {
//         id: '3-1',
//         name: 'Sketchfab',
//         url: 'https://sketchfab.com',
//         description: 'Platform for 3D & AR on the web',
//       },
//     ],
//   },
//   {
//     id: '4',
//     name: 'Icons',
//     resources: [
//       {
//         id: '4-1',
//         name: 'Lucide Icons',
//         url: 'https://lucide.dev',
//         description: 'Beautiful & consistent icon toolkit',
//       },
//       {
//         id: '4-2',
//         name: 'Heroicons',
//         url: 'https://heroicons.com',
//         description: 'Beautiful hand-crafted SVG icons',
//       },
//     ],
//   },
// ];
const initialCategories: Category[] = [
  {
    id: '1',
    name: 'CSS Tools',
    resources: [
      {
        id: '1-1',
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        description: 'A utility-first CSS framework for rapid UI development',
      }]}]
export function Testerpage() {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('resourceCategories');
    return saved ? JSON.parse(saved) : initialCategories;
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<{ categoryId: string; resource: Resource } | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    newCategory: '',
    name: '',
    url: '',
    description: '',
  });

  // Save to localStorage whenever categories change
  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('resourceCategories', JSON.stringify(newCategories));
  };

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        resources: category.resources.filter(
          (resource) =>
            resource.name.toLowerCase().includes(query) ||
            resource.description.toLowerCase().includes(query) ||
            category.name.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.resources.length > 0);
  }, [categories, searchQuery]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const openAddModal = () => {
    setEditingResource(null);
    setFormData({
      category: categories[0]?.id || '',
      newCategory: '',
      name: '',
      url: '',
      description: '',
    });
    setShowModal(true);
  };

  const openEditModal = (categoryId: string, resource: Resource) => {
    setEditingResource({ categoryId, resource });
    setFormData({
      category: categoryId,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetCategoryId = formData.newCategory.trim()
      ? `new-${Date.now()}`
      : formData.category;

    let newCategories = [...categories];

    if (editingResource) {
      // Edit existing resource
      newCategories = newCategories.map((cat) => {
        if (cat.id === editingResource.categoryId) {
          return {
            ...cat,
            resources: cat.resources.filter((r) => r.id !== editingResource.resource.id),
          };
        }
        return cat;
      });

      const targetCategory = newCategories.find((cat) => cat.id === targetCategoryId);
      if (targetCategory) {
        targetCategory.resources.push({
          ...editingResource.resource,
          name: formData.name,
          url: formData.url,
          description: formData.description,
        });
      } else if (formData.newCategory.trim()) {
        newCategories.push({
          id: targetCategoryId,
          name: formData.newCategory.trim(),
          resources: [
            {
              ...editingResource.resource,
              name: formData.name,
              url: formData.url,
              description: formData.description,
            },
          ],
        });
      }
    } else {
      // Add new resource
      const newResource: Resource = {
        id: `${Date.now()}-${Math.random()}`,
        name: formData.name,
        url: formData.url,
        description: formData.description,
      };

      if (formData.newCategory.trim()) {
        newCategories.push({
          id: targetCategoryId,
          name: formData.newCategory.trim(),
          resources: [newResource],
        });
        setExpandedCategories(new Set([...expandedCategories, targetCategoryId]));
      } else {
        newCategories = newCategories.map((cat) => {
          if (cat.id === formData.category) {
            return {
              ...cat,
              resources: [...cat.resources, newResource],
            };
          }
          return cat;
        });
      }
    }

    // Remove empty categories
    newCategories = newCategories.filter((cat) => cat.resources.length > 0);

    saveCategories(newCategories);
    closeModal();
  };

  const deleteResource = (categoryId: string, resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    let newCategories = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          resources: cat.resources.filter((r) => r.id !== resourceId),
        };
      }
      return cat;
    });

    // Remove empty categories
    newCategories = newCategories.filter((cat) => cat.resources.length > 0);

    saveCategories(newCategories);
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">Resource Library</h1>
            <p className="theme-text-secondary">Organize and access your favorite web resources</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 theme-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Resource</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-tertiary" />
          <input
            type="text"
            placeholder="Search resources by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 theme-bg-secondary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-tertiary hover:theme-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
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
              <p className="text-2xl font-bold theme-text-primary">
                {categories.reduce((sum, cat) => sum + cat.resources.length, 0)}
              </p>
              <p className="text-sm theme-text-secondary">Resources</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Accordion */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 theme-bg-secondary theme-border border rounded-xl">
            <Globe className="w-12 h-12 theme-text-tertiary mx-auto mb-3" />
            <p className="theme-text-secondary">
              {searchQuery ? 'No resources found matching your search' : 'No resources yet. Add your first one!'}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            return (
              <div
                key={category.id}
                className="theme-bg-secondary theme-border border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:theme-bg-tertiary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 theme-text-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 theme-text-secondary" />
                    )}
                    <h3 className="text-lg font-semibold theme-text-primary">{category.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium theme-bg-tertiary theme-text-secondary rounded-full">
                      {category.resources.length}
                    </span>
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="px-6 pb-4 space-y-3">
                    {category.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="theme-bg-tertiary theme-border border rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Favicon */}
                            <div className="flex-shrink-0 mt-1">
                              {getFavicon(resource.url) ? (
                                <img
                                  src={getFavicon(resource.url)!}
                                  alt=""
                                  className="w-6 h-6 rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Globe className="w-6 h-6 theme-text-tertiary" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 mb-1"
                              >
                                <h4 className="font-semibold theme-text-primary group-hover:text-blue-500 transition-colors truncate">
                                  {resource.name}
                                </h4>
                                <ExternalLink className="w-4 h-4 theme-text-tertiary group-hover:text-blue-500 flex-shrink-0" />
                              </a>
                              <p className="text-sm theme-text-secondary line-clamp-2">
                                {resource.description}
                              </p>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs theme-text-tertiary hover:text-blue-500 transition-colors mt-1 inline-block truncate max-w-full"
                              >
                                {resource.url}
                              </a>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => openEditModal(category.id, resource)}
                              className="p-2 theme-text-secondary hover:theme-text-primary hover:theme-bg-primary rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteResource(category.id, resource.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Tailwind CSS"
                  className="w-full px-4 py-2 theme-bg-tertiary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the resource"
                  rows={3}
                  className="w-full px-4 py-2 theme-bg-tertiary theme-border border rounded-lg theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
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
