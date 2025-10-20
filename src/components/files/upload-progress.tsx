'use client';// components/files/upload-progress.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';import { Progress } from '@/components/ui/progress';

import { Progress } from '@/components/ui/progress';import { Button } from '@/components/ui/button';

import { import { Badge } from '@/components/ui/badge';

  CheckCircle, import { X, Play, Pause, AlertCircle, CheckCircle, File } from 'lucide-react';

  XCircle, import { useTheme } from 'next-themes';

  Clock, import { cn } from '@/lib/utils';

  Upload as UploadIcon, 

  X, interface UploadTask {

  Play,   id: string;

  Pause,   file: File;

  MinusCircle   progress: number;

} from 'lucide-react';  status: 'uploading' | 'completed' | 'error' | 'paused';

  error?: string;

interface UploadTask {  speed?: number; // bytes per second

  id: string;  timeRemaining?: number; // seconds

  file: File;}

  status: 'uploading' | 'completed' | 'error' | 'paused';

  progress: number;interface UploadProgressProps {

  error?: string;  uploads: UploadTask[];

  speed?: number;  onCancel: (id: string) => void;

  timeRemaining?: number;  onRetry: (id: string) => void;

}  onPause: (id: string) => void;

  onResume: (id: string) => void;

interface UploadProgressProps {  onClear: () => void;

  uploads: UploadTask[];}

  onCancel: (id: string) => void;

  onRetry: (id: string) => void;export function UploadProgress({

  onPause: (id: string) => void;  uploads,

  onResume: (id: string) => void;  onCancel,

  onClearCompleted: () => void;  onRetry,

  onClearAll: () => void;  onPause,

}  onResume,

  onClear

export function UploadProgress({}: UploadProgressProps) {

  uploads,  const { theme } = useTheme();

  onCancel,

  onRetry,  const formatFileSize = (bytes: number): string => {

  onPause,    if (bytes === 0) return '0 Bytes';

  onResume,    const k = 1024;

  onClearCompleted,    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  onClearAll,    const i = Math.floor(Math.log(bytes) / Math.log(k));

}: UploadProgressProps) {    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];

  const formatFileSize = (bytes: number) => {  };

    if (bytes === 0) return '0 Bytes';

    const k = 1024;  const formatSpeed = (bytesPerSecond: number): string => {

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];    return formatFileSize(bytesPerSecond) + '/s';

    const i = Math.floor(Math.log(bytes) / Math.log(k));  };

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];

  };  const formatTimeRemaining = (seconds: number): string => {

    if (seconds < 60) return `${Math.round(seconds)}s`;

  const formatSpeed = (bytesPerSecond: number) => {    const minutes = Math.floor(seconds / 60);

    return formatFileSize(bytesPerSecond) + '/s';    const remainingSeconds = Math.round(seconds % 60);

  };    return `${minutes}m ${remainingSeconds}s`;

  };

  const formatTimeRemaining = (seconds: number) => {

    if (seconds < 60) return `${Math.round(seconds)}s`;  const getStatusIcon = (status: UploadTask['status'], error?: string) => {

    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;    switch (status) {

    return `${Math.round(seconds / 3600)}h`;      case 'completed':

  };        return <CheckCircle className="w-4 h-4 text-green-500" />;

      case 'error':

  const getStatusIcon = (status: UploadTask['status'], error?: string) => {        return <AlertCircle className="w-4 h-4 text-red-500" />;

    switch (status) {      case 'paused':

      case 'completed':        return <Pause className="w-4 h-4 text-yellow-500" />;

        return <CheckCircle className="w-4 h-4 text-green-500" />;      default:

      case 'error':        return <File className="w-4 h-4 text-blue-500" />;

        return <XCircle className="w-4 h-4 text-red-500" />;    }

      case 'paused':  };

        return <Pause className="w-4 h-4 text-yellow-500" />;

      default:  const getStatusBadge = (status: UploadTask['status']) => {

        return <UploadIcon className="w-4 h-4 text-blue-500" />;    const variants = {

    }      uploading: 'default',

  };      completed: 'default',

      error: 'destructive',

  const getStatusBadge = (status: UploadTask['status']) => {      paused: 'secondary'

    const variants = {    } as const;

      uploading: 'default',

      completed: 'default',    const labels = {

      error: 'destructive',      uploading: 'Uploading',

      paused: 'secondary'      completed: 'Completed',

    } as const;      error: 'Error',

      paused: 'Paused'

    const labels = {    };

      uploading: 'Uploading',

      completed: 'Completed',    return (

      error: 'Error',      <Badge variant={variants[status]}>

      paused: 'Paused'        {labels[status]}

    };      </Badge>

    );

    return (  };

      <Badge variant={variants[status]}>

        {labels[status]}  const activeUploads = uploads.filter(u => u.status === 'uploading' || u.status === 'paused');

      </Badge>  const completedUploads = uploads.filter(u => u.status === 'completed');

    );  const failedUploads = uploads.filter(u => u.status === 'error');

  };

  if (uploads.length === 0) return null;

  const activeUploads = uploads.filter(u => u.status === 'uploading' || u.status === 'paused');

  const completedUploads = uploads.filter(u => u.status === 'completed');  return (

  const failedUploads = uploads.filter(u => u.status === 'error');    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">

      <CardHeader className="pb-3">

  if (uploads.length === 0) return null;        <div className="flex items-center justify-between">

          <CardTitle className="text-sm">Uploads</CardTitle>

  return (          <div className="flex items-center space-x-2">

    <Card className="w-full">            {completedUploads.length > 0 && (

      <CardHeader>              <Button variant="ghost" size="sm" onClick={onClear}>

        <div className="flex items-center justify-between">                Clear Completed

          <CardTitle className="text-lg">              </Button>

            File Uploads ({uploads.length})            )}

          </CardTitle>          </div>

          <div className="flex space-x-2">        </CardHeader>

            {completedUploads.length > 0 && (        <CardContent className="space-y-4 max-h-96 overflow-y-auto">

              <Button          {uploads.map((upload) => (

                variant="outline"          <div

                size="sm"            key={upload.id}

                onClick={onClearCompleted}            className="space-y-2 p-3 rounded-lg border"

              >          >

                Clear Completed            <div className="flex items-start justify-between">

              </Button>              <div className="flex items-center space-x-2 min-w-0 flex-1">

            )}                {getStatusIcon(upload.status, upload.error)}

            {uploads.length > 0 && (                <div className="min-w-0 flex-1">

              <Button                  <p className="text-sm font-medium truncate">

                variant="outline"                    {upload.file.name}

                size="sm"                  </p>

                onClick={onClearAll}                  <div className="flex items-center space-x-2 mt-1">

              >                    {getStatusBadge(upload.status)}

                Clear All                    <span className="text-xs text-muted-foreground">

              </Button>                      {formatFileSize(upload.file.size)}

            )}                    </span>

          </div>                  </div>

        </div>                </div>

      </CardHeader>              </div>

      <CardContent className="space-y-4 max-h-96 overflow-y-auto">

        {uploads.map((upload) => (              <div className="flex items-center space-x-1">

          <div                {upload.status === 'uploading' && (

            key={upload.id}                  <Button

            className="space-y-2 p-3 rounded-lg border"                    variant="ghost"

          >                    size="sm"

            <div className="flex items-start justify-between">                    onClick={() => onPause(upload.id)}

              <div className="flex items-center space-x-2 min-w-0 flex-1">                  >

                {getStatusIcon(upload.status, upload.error)}                    <Pause className="w-3 h-3" />

                <div className="min-w-0 flex-1">                  </Button>

                  <p className="text-sm font-medium truncate">                )}

                    {upload.file.name}                {upload.status === 'paused' && (

                  </p>                  <Button

                  <div className="flex items-center space-x-2 mt-1">                    variant="ghost"

                    {getStatusBadge(upload.status)}                    size="sm"

                    <span className="text-xs text-muted-foreground">                    onClick={() => onResume(upload.id)}

                      {formatFileSize(upload.file.size)}                  >

                    </span>                    <Play className="w-3 h-3" />

                  </div>                  </Button>

                </div>                )}

              </div>                {(upload.status === 'uploading' || upload.status === 'paused') && (

                  <Button

              <div className="flex items-center space-x-1">                    variant="ghost"

                {upload.status === 'paused' && (                    size="sm"

                  <Button                    onClick={() => onCancel(upload.id)}

                    variant="ghost"                  >

                    size="sm"                    <X className="w-3 h-3" />

                    onClick={() => onResume(upload.id)}                  </Button>

                  >                )}

                    <Play className="w-3 h-3" />                {upload.status === 'error' && (

                  </Button>                  <Button

                )}                    variant="ghost"

                {upload.status === 'uploading' && (                    size="sm"

                  <Button                    onClick={() => onRetry(upload.id)}

                    variant="ghost"                  >

                    size="sm"                    Retry

                    onClick={() => onPause(upload.id)}                  </Button>

                  >                )}

                    <Pause className="w-3 h-3" />              </div>

                  </Button>            </div>

                )}

                {(upload.status === 'uploading' || upload.status === 'paused') && (            {upload.status === 'uploading' && (

                  <Button              <>

                    variant="ghost"                <Progress value={upload.progress} className="h-2" />

                    size="sm"                <div className="flex justify-between text-xs text-muted-foreground">

                    onClick={() => onCancel(upload.id)}                  <span>{upload.progress}%</span>

                  >                  <div className="flex items-center space-x-4">

                    <X className="w-3 h-3" />                    {upload.speed && (

                  </Button>                      <span>{formatSpeed(upload.speed)}</span>

                )}                    )}

                {upload.status === 'error' && (                    {upload.timeRemaining && (

                  <Button                      <span>{formatTimeRemaining(upload.timeRemaining)}</span>

                    variant="ghost"                    )}

                    size="sm"                  </div>

                    onClick={() => onRetry(upload.id)}                </div>

                  >              </>

                    Retry            )}

                  </Button>

                )}            {upload.status === 'error' && upload.error && (

              </div>              <p className="text-xs text-red-600 dark:text-red-400">

            </div>                {upload.error}

              </p>

            {upload.status === 'uploading' && (            )}

              <>          </div>

                <Progress value={upload.progress} className="h-2" />        ))}

                <div className="flex justify-between text-xs text-muted-foreground">

                  <span>{upload.progress}%</span>        {/* Summary */}

                  <div className="flex items-center space-x-4">        <div className="pt-2 border-t text-xs text-muted-foreground">

                    {upload.speed && (          <div className="flex justify-between">

                      <span>{formatSpeed(upload.speed)}</span>            <span>Active: {activeUploads.length}</span>

                    )}            <span>Completed: {completedUploads.length}</span>

                    {upload.timeRemaining && (            <span>Failed: {failedUploads.length}</span>

                      <span>{formatTimeRemaining(upload.timeRemaining)}</span>          </div>

                    )}        </div>

                  </div>      </CardContent>

                </div>    </Card>

              </>  );

            )}}

            {upload.status === 'error' && upload.error && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {upload.error}
              </p>
            )}
          </div>
        ))}

        {/* Summary */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Active: {activeUploads.length}</span>
            <span>Completed: {completedUploads.length}</span>
            <span>Failed: {failedUploads.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}