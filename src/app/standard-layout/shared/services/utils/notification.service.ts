import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {

    constructor(private matSnackbar: MatSnackBar) {}

    /**
     * Opens a popup menu to show a new notifications on the user interface.
     *
     * @param message The message that will be shown on the user interface.
     * @param action The label for the snackbar action that will be displayed.
     */
    public displayNotification(message: string, action: string): void {
        this.matSnackbar.open(message, action, {
            duration: 4000,
        });
    }
}
