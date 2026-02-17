import type { Documentation } from '../types/dashboard.types';

interface DocumentationLinksProps {
    documentation: Documentation[];
}

export function DocumentationLinks({ documentation }: DocumentationLinksProps) {
    if (documentation.length === 0) {
        return null;
    }

    return (
        <div className="mb-6 border border-slate-700 rounded-lg bg-[#1e293b]">
            <div className="flex items-center gap-2 mb-4 bg-[#0f172a] w-full p-2">
                <i className="pi pi-file text-slate-400"></i>
                <h2 className="text-lg font-semibold text-white">Relevant Documentation</h2>
            </div>

            <div className="p-2 space-y-3">
                {documentation.map((doc, index) => (
                    <div key={index} className="border-b border-slate-700 pb-2 last:border-b-0">
                        <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="doc-link text-sm font-medium block mb-1"
                        >
                            {doc.title}
                        </a>
                        <p className="text-xs text-slate-400 mb-1">{doc.description}</p>
                        <span className="text-xs text-slate-500">
                            <i className="pi pi-folder mr-1"></i>
                            {doc.folderName}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
