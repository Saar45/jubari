import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { AuthService } from './services/auth.service';
import { 
  logOutOutline, eyeOutline, eyeOffOutline, gridOutline,
  calendarOutline, timeOutline, peopleOutline, hourglassOutline,
  checkmarkCircleOutline, chatbubblesOutline, documentTextOutline,
  createOutline, trashOutline, addOutline, closeCircleOutline,
  informationCircleOutline,
  sunnyOutline,
  medicalOutline,
  warningOutline,
  calendarNumberOutline,
  shieldCheckmark,
  personOutline,
  mailOutline,
  homeOutline,
  locationOutline,
  businessOutline,
  briefcaseOutline,
  person,
  create,
  mail,
  closeOutline,
  close,
  checkmarkCircle,
  constructOutline,
  alertCircle,
  funnelOutline,
  airplaneOutline,
  calendarClearSharp,
  calendarClearOutline,
  mapOutline,
  lockClosedOutline,
  sendOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  template: '<ion-app><ion-router-outlet></ion-router-outlet></ion-app>',
  standalone: true,
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private authService: AuthService
  ) {
    addIcons({
      logOutOutline, eyeOutline, eyeOffOutline, gridOutline,
      calendarOutline, timeOutline, peopleOutline, hourglassOutline,
      checkmarkCircleOutline, chatbubblesOutline, documentTextOutline,
      createOutline, trashOutline, addOutline, closeCircleOutline, informationCircleOutline, sunnyOutline, medicalOutline, warningOutline, calendarNumberOutline, shieldCheckmark, personOutline, mailOutline, homeOutline, locationOutline, businessOutline, briefcaseOutline, person, create, mail, closeOutline, close, checkmarkCircle, constructOutline, alertCircle, funnelOutline, airplaneOutline, calendarClearOutline, mapOutline, lockClosedOutline, sendOutline
    });
  }

  ngOnInit() {
    // AuthService will handle activity monitoring automatically
  }

  ngOnDestroy() {
    // AuthService will handle cleanup in its own ngOnDestroy
  }
}
