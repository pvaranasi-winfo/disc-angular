import type { Component } from '../types/dashboard.types';

interface ComponentCardProps {
    component: Component;
}

export function ComponentCard({ component }: ComponentCardProps) {
    const getComponentIcon = (type: string) => {
        switch (type) {
            case 'Database':
                return { icon: 'pi pi-database', class: 'database' };
            case 'Application':
                return { icon: 'pi pi-cog', class: 'application' };
            case 'Service':
                return { icon: 'pi pi-wrench', class: 'service' };
            default:
                return { icon: 'pi pi-box', class: 'application' };
        }
    };

    const iconInfo = getComponentIcon(component.type);

    return (
        <div className="dashboard-card p-4 mb-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                    <div className={`component-icon ${iconInfo.class}`}>
                        <i className={iconInfo.icon}></i>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-white mb-1">{component.name}</h3>
                        <p className="text-sm text-slate-400 mb-2">v{component.currentVersion}</p>

                        {component.subComponents && component.subComponents.length > 0 && (
                            <div className="mt-3 space-y-1">
                                {component.subComponents.map((sub, index) => (
                                    <div key={index} className="text-sm text-slate-400">
                                        <span className="font-medium">{sub.name}:</span> v{sub.version}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <span className={component.status === 'Active' ? 'badge-active' : 'badge-upgrade'}>
                        {component.status === 'Active' ? 'ACTIVE' : 'UPGRADE AVAILABLE'}
                    </span>
                </div>
            </div>
        </div>
    );
}
