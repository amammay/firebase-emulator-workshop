import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {auth, firestore} from "firebase/app";
import {AngularFirestore} from "@angular/fire/firestore";
import {Observable} from "rxjs";
import {AngularFireFunctions} from "@angular/fire/functions";
import {first, take} from "rxjs/operators";
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public someData: Observable<any>

  constructor(public readonly fbAuth: AngularFireAuth,
              public readonly firestore: AngularFirestore,
              private readonly aff: AngularFireFunctions) {
    // @ts-ignore
    this.someData = this.firestore.collection('buttonPresser').valueChanges();
  }

  public ngOnInit() {
    if (environment.emulator) {
      this.aff.useFunctionsEmulator('http://localhost:5001').then(() => console.log('Using functions emulator'))
    }
  }


  async googLogin(): Promise<void> {
    await this.fbAuth.signInWithPopup(new auth.GoogleAuthProvider())
  }


  clickClack() {
    this.firestore.collection('buttonPresser').doc(this.firestore.createId()).set({timeHit: firestore.FieldValue.serverTimestamp()})
  }

  async deleteAll() {
    const ref = this.aff.httpsCallable('deleteAll')
    await ref({}).pipe(take(1)).toPromise();
  }

}
