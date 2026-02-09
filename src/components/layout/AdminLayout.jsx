import Sidebar from './Sidebar'

const AdminLayout = ({ children, title, subtitle, breadcrumb, actions }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-background-light">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-3 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        {breadcrumb && (
                            <>
                                <span className="text-text-secondary text-sm font-medium">Admin</span>
                                <span className="text-text-secondary text-sm">/</span>
                                <span className="text-text-primary text-sm font-semibold">{breadcrumb}</span>
                            </>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-4">
                            {actions}
                        </div>
                    )}
                </header>

                {/* Page content */}
                <div className="p-8 max-w-7xl mx-auto w-full">
                    {(title || subtitle) && (
                        <div className="mb-8">
                            {title && (
                                <h2 className="text-3xl font-black tracking-tight text-text-primary mb-2">
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
