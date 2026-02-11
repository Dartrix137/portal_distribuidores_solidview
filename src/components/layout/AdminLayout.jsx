import { useState } from 'react'
import Sidebar from './Sidebar'

const AdminLayout = ({ children, title, subtitle, breadcrumb, actions }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-background-light">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 py-3 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
                            aria-label="Abrir menú"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>

                        {breadcrumb && (
                            <>
                                <span className="text-text-secondary text-sm font-medium">Admin</span>
                                <span className="text-text-secondary text-sm">/</span>
                                <span className="text-text-primary text-sm font-semibold">{breadcrumb}</span>
                            </>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2 md:gap-4">
                            {actions}
                        </div>
                    )}
                </header>

                {/* Page content */}
                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {(title || subtitle) && (
                        <div className="mb-8">
                            {title && (
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-text-primary mb-2">
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className="text-text-secondary">{subtitle}</p>
                            )}
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    )
}

export default AdminLayout

