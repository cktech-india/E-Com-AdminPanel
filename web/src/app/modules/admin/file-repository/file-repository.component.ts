import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { EntityApiService } from '../../shared/api-services/entity.api.service';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { UiService } from '../../../ui.service';
import { AuthService } from "../../../core/auth/auth.service";
import { Clipboard } from "@angular/cdk/clipboard";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface FoodNode {
    name: string;
    children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
    {
        name: 'Fruit',
        children: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Fruit loops' }],
    },
    {
        name: 'Vegetables',
        children: [
            {
                name: 'Green',
                children: [{ name: 'Broccoli' }, { name: 'Brussels sprouts' }],
            },
            {
                name: 'Orange',
                children: [{ name: 'Pumpkins' }, { name: 'Carrots' }],
            },
        ],
    },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
    expandable: boolean;
    name: string;
    level: number;
}


interface FileItem {
    name: string;
    type: 'folder' | 'file';
    url?: string;
    extension?: string;
}

@Component({
    selector: 'app-file-repository',
    templateUrl: './file-repository.component.html',
    styleUrls: ['./file-repository.component.css'],
    standalone: true,
    imports: [MatIcon, MatButtonModule, MatTooltipModule]
})
export class FileRepositoryComponent implements OnInit {

    allPaths: string[] = [];

    currentPath: string = '/';
    items: FileItem[] = [];

    constructor(private entityService: EntityApiService, private http: HttpClient,
        private clipboard: Clipboard, private auth: AuthService, private _ui: UiService) {
        this.dataSource.data = TREE_DATA;
    }


    ngOnInit(): void {
        this.entityService.getEntityDefinitionList().subscribe((res: any[]) => {
            res.forEach(e => {
                e.name = e.entityName;
                e.children = [{ name: 'test' }];
            });
            this.entityList = res;
            this.dataSource.data = this.entityList;
        });
        this.getPathList();
        this.updateView();

    }

    get pathSegments(): { name: string; path: string }[] {
        const parts = this.currentPath.split('/').filter(Boolean);
        const segments: { name: string; path: string }[] = [];
        let accumulated = '/';
        for (const part of parts) {
            accumulated += part + '/';
            segments.push({ name: part, path: accumulated });
        }
        return segments;
    }

    navigateToSegment(path: string): void {
        this.currentPath = path;
        this.updateView();
    }

    getFileType(name: string): string {
        const ext = name.split('.').pop()?.toLowerCase();
        if (!ext) return 'other';

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
        if (ext === 'pdf') return 'pdf';
        if (['doc', 'docx'].includes(ext)) return 'word';
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
        if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
        if (['txt', 'rtf'].includes(ext)) return 'text';
        if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm'].includes(ext)) return 'video';
        if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) return 'audio';
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'zip';
        if (['html', 'css', 'js', 'ts', 'json', 'java', 'py', 'c', 'cpp'].includes(ext)) return 'code';
        if (ext === 'xml') return 'xml';

        return 'other';
    }

    getFileIcon(name: string): string {
        const type = this.getFileType(name);
        switch (type) {
            case 'image': return 'image';
            case 'pdf': return 'picture_as_pdf';
            case 'word': return 'description';
            case 'excel': return 'table_chart';
            case 'powerpoint': return 'slideshow';
            case 'text': return 'article';
            case 'video': return 'movie';
            case 'audio': return 'audiotrack';
            case 'zip': return 'archive';
            case 'code': return 'code';
            case 'xml': return 'integration_instructions';
            default: return 'insert_drive_file';
        }
    }

    getFileIconColor(name: string): string {
        const type = this.getFileType(name);
        switch (type) {
            case 'image': return '#4CAF50';
            case 'pdf': return '#F44336';
            case 'word': return '#2196F3';
            case 'excel': return '#4CAF50';
            case 'powerpoint': return '#FF9800';
            case 'text': return '#607D8B';
            case 'video': return '#9C27B0';
            case 'audio': return '#E91E63';
            case 'zip': return '#795548';
            case 'code': return '#00BCD4';
            case 'xml': return '#FF5722';
            default: return '#9E9E9E';
        }
    }

    getPathList() {
        this.http.get(sessionStorage.getItem('apiUrl') + 'file/file-path-list', this._ui.httpOptions)
            .subscribe((res: any) => {
                this.allPaths = [];
                res.forEach((e: any) => this.allPaths.push(e.filePath));
                this.updateView();
            });
    }

    getApiUrl(fileName: string): string {
        const currentFolder = this.currentPath.endsWith('/') ? this.currentPath : this.currentPath + '/';
        const fullPath = currentFolder + fileName;
        return sessionStorage.getItem('apiUrl') + 'file/my-file?filePath=' + encodeURIComponent(fullPath);
    }

    loadImages(): void {
        let domainAssetPath = '';
        try {
            const appConfig = JSON.parse(atob(sessionStorage.getItem('appConfig')));
            domainAssetPath = appConfig['domain-asset-path'] || appConfig['domainAssetPath'] || '';
        } catch (e) {
            console.error('Failed to parse appConfig in loadImages', e);
        }

        this.items.forEach(item => {
            if (item.type === 'file' && this.getFileType(item.name) === 'image') {
                if (domainAssetPath) {
                    const currentFolder = this.currentPath.endsWith('/') ? this.currentPath : this.currentPath + '/';
                    let filePath = currentFolder + item.name;
                    if (filePath.startsWith('/')) {
                        filePath = filePath.substring(1);
                    }
                    let base = domainAssetPath;
                    if (!base.endsWith('/')) {
                        base += '/';
                    }
                    item.url = base + filePath;
                } else if (item.url && !item.url.startsWith('blob:')) {
                    this.http.get(item.url, { responseType: 'blob' }).subscribe({
                        next: (blob) => {
                            item.url = URL.createObjectURL(blob);
                        },
                        error: (err) => {
                            console.error('Failed to load image preview:', item.name, err);
                        }
                    });
                }
            }
        });
    }

    updateView(): void {
        const normalizedPath = this.currentPath.endsWith('/') ? this.currentPath : this.currentPath + '/';
        const folders = new Set<string>();
        const files: FileItem[] = [];

        for (const fullPath of this.allPaths) {
            if (fullPath.startsWith(normalizedPath) && fullPath !== this.currentPath) {
                const remainder = fullPath.slice(normalizedPath.length);
                const parts = remainder.split('/');
                const firstPart = parts[0];
                if (parts.length === 1 && !fullPath.endsWith('/')) {
                    // It's a file
                    const extension = firstPart.split('.').pop() || '';
                    files.push({
                        name: firstPart, type: 'file', extension,
                        url: this.getApiUrl(firstPart)
                    });
                    console.log(fullPath)
                } else {
                    // It's a folder
                    folders.add(firstPart);
                }
            }
        }

        const folderItems: FileItem[] = Array.from(folders).map(name => ({ name, type: 'folder' }));
        this.items = [...folderItems, ...files];
        this.loadImages();
    }

    // Handle file download
    downloadFile(item: FileItem) {
        if (!item.url) return;

        if (item.url.startsWith('blob:')) {
            const a = document.createElement('a');
            a.href = item.url;
            a.download = item.name;
            a.click();
            return;
        }

        this.http.get(item.url, { responseType: 'blob' }).subscribe({
            next: (blob) => {
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = item.name;
                a.click();
                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            },
            error: (err) => {
                this._ui.errorAlert('Failed to download file.');
                console.error(err);
            }
        });
    }

    // Handle file deletion
    deleteFile(item: any) {
        if (confirm('Are you sure you want to delete this file?')) {
            console.log(item)
            this.http.delete(sessionStorage.getItem('apiUrl') + 'file/delete?fileName=' + btoa(item.name) + "&filePath=" + btoa(this.currentPath), this._ui.httpOptions)
                .subscribe((res: any) => {
                    this._ui.successAlert('File deleted successfully');
                    this.getPathList();
                });
        }
    }

    // Handle copying the file URL to the clipboard
    copyToClipboard(item: FileItem) {
        console.log(item)
        let copyUrl = this.getApiUrl(item.name);
        try {
            const appConfig = JSON.parse(atob(sessionStorage.getItem('appConfig')));
            const domainAssetPath = appConfig['domain-asset-path'] || appConfig['domainAssetPath'];
            if (domainAssetPath) {
                const currentFolder = this.currentPath.endsWith('/') ? this.currentPath : this.currentPath + '/';
                let filePath = currentFolder + item.name;
                if (filePath.startsWith('/')) {
                    filePath = filePath.substring(1);
                }
                let base = domainAssetPath;
                if (!base.endsWith('/')) {
                    base += '/';
                }
                copyUrl = base + filePath;
            }
        } catch (e) {
            console.error('Failed to parse appConfig for copy link', e);
        }
        this.clipboard.copy(copyUrl);
        this._ui.showToastr('','Link copied to clipboard', 'info', 1000);
        console.log(`URL copied: ${copyUrl}`);
    }

    goToFolder(folderName: string): void {
        if (!this.currentPath.endsWith('/')) {
            this.currentPath += '/';
        }
        this.currentPath += folderName + '/';
        this.updateView();
    }

    goBack(): void {
        const segments = this.currentPath.split('/').filter(Boolean);
        if (segments.length > 1) {
            segments.pop();
            this.currentPath = '/' + segments.join('/') + '/';
            this.updateView();
        } else {
            this.currentPath = '/';
            this.updateView();
        }
    }

    createFolder(): void {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            const newFolderPath = this.currentPath + folderName + '/';
            if (!this.allPaths.includes(newFolderPath)) {
                this.allPaths.push(newFolderPath);
                this.updateView();
            }
        }
    }

    uploadFile(event: any): void {
        let token = JSON.parse((sessionStorage.getItem('currentUser') as string)).token;
        const headers = new HttpHeaders()
            .set('Authorization', (token ? 'Bearer ' + token : ''))
            .set('X-tenant', sessionStorage.getItem('tenantId') || '');

        for (const f of event.target.files) {
            var form = new FormData();
            form.append('file', f);
            // The relative path includes folder structure
            let relativePath = f.webkitRelativePath || f.name;
            if (relativePath.includes("/")) {
                relativePath = relativePath.substring(0, relativePath.lastIndexOf("/") + 1)
            } else {
                relativePath = '';
            }
            console.log(relativePath)
            form.append('filePath', this.currentPath + relativePath); // extra param
            this.http.post(sessionStorage.getItem('apiUrl') + 'file/upload', form, { headers })
                .subscribe((res: any) => {
                    console.log(res);
                    this._ui.successAlert('Uploaded' + f.name)
                    this.getPathList();
                });
        }
        /*if (file) {
            const newFilePath = this.currentPath + file.name;
            this.allPaths.push(newFilePath);
            this.updateView();
        }*/
    }


    hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
    entityList: any[] = [];

    onNodeClicked(node: any) {
        this.dataSource.data = this.entityList;
    }

    private _transformer = (node: FoodNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            level: level,
        };
    };

    treeControl = new FlatTreeControl<ExampleFlatNode>(
        node => node.level,
        node => node.expandable,
    );

    treeFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

}