#Firebase Emulator Workshop

Goal of this little project is to show case some examples of how to leverage the
firebase emulator suite in accelerating your local development experience by not using your production database/triggers!

# Background Information

First lets get a better understanding of the products we are going to be using and more importantly, how we can use them to easily get our app up and running locally.

## Firebase

If we can get our firebase products working independently from the client app that will be a pretty quick win. This will just prove out that our configurations are looking good, and we can run the infrastructure in a silo'ed environment.

### Functions
Inside of `functions/index.js` you will see we have two functions available, one is a firestore event trigger, and one a https.onCall Function

**Firestore Event Trigger**  this watches for new documents created on a collection called `buttonPresser`, and upon that new document created
it will just add a field to the document `{server: 'side'}` to show that the cloud function is properly working. 

```javascript
exports.buttonHit = functions.firestore.document('buttonPresser/{docId}').onCreate(async (snapshot, context) => {
  await snapshot.ref.update({server: 'side'})
})
```

**https.onCall** this is an invokable function, that as long as the user has been properly authed into the application, allow them to delete all documents in `buttonPresser` collection.

```javascript
exports.deleteAll = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'No Auth provided')
  }
  const allDocs = await firestore.collection('buttonPresser').listDocuments();

  const deleter = async (ref) => await ref.delete();
  let promiseArray = [];
  for (const firestoreElement of allDocs) {
    promiseArray.push(deleter(firestoreElement));
  }
  await Promise.all(promiseArray);

})
```

### Firestore

Our firebase database rules are pretty simple, we allow any authed users to read and create new documents into firestore, but we don't allow them to delete directly. 

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow create, read: if request.auth != null;
    }
  }
}
```
 
### Emulators

The emulators we are mainly using is the firestore emulator and the functions emulator for nodejs. 
From the root of this repo we can run `firebase emulators:start` to see our emulators come online. To verify everything is talking to each other,
lets attempt to trigger our firestore event trigger in the emulator ui by going to `http://localhost:4000/firestore` and creating our `buttonPresser` collection
 ![collection screen shot](https://dev-to-uploads.s3.amazonaws.com/i/2m18y3cfz3569bzbsq7w.png)
 
Upon us hitting save we should see our cloud function add the data into the document we just created 
![document created screenshot](https://dev-to-uploads.s3.amazonaws.com/i/7fyrhnjbrxhzv9rx3zlt.png)


Now at this point we see the emulators are happily talking to each other and now we can shift focus over to the client application.

## Client Application

Let us take a look at this regular angular application we have that is pointed to our live production database, and make it so it can be pointed to our firestore emulator suite.

Within `src/environments/environment.ts` lets add new a field of `emulator:true` and then register a new firestore configuration provider. 

What the code below will do is to check if we want to use the firestore emulator,
 if we do then go ahead and provide the host name and ssl config to use for talking to the emulator. The firestore emulator by default will run on port 8080, but you may want to double check your config in your `firebase.json` file.

`src/app/app.module.ts`

```typescript

import {AngularFirestoreModule, SETTINGS} from "@angular/fire/firestore";

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
  ],
  providers: [{
    provide: SETTINGS,
    useValue: environment.emulator ? {
      host: 'localhost:8080',
      ssl: false
    } : undefined
  }],
  bootstrap: [...]
})
export class AppModule {
}

```

So that will get us to point to the emulator for firestore, but what about the functions emulator?

Well if we take a look at our usage of the firebase functions service we will check our env config again to see if want to use the emulator, if we do, then provide the base url for it use to talk to the emulator.

`src/app/app.component.ts`
```typescript
public ngOnInit() {
    if (environment.emulator) {
      this.aff.useFunctionsEmulator('http://localhost:5001').then(() => console.log('Using functions emulator'))
    }
}
```


**NOTE:** The overall concept is the same for the other firebase client sdk's but the syntax will change between implementations. 
The main goal is to really just tell the firebase sdk's that you want to use a different url for that service to point to.

## Now All Together!

Within the root `package.json` you will see a script `start:all` you can invoke this by running `npm run start:all` this will spin up the emulators and run the angular project in watch mode.

Now navigate to `localhost:4200` you will need to login with the google auth provider. 

From there you should see some seed data already loaded into the web app.

![web app screenshot](https://dev-to-uploads.s3.amazonaws.com/i/p6q4174v1jqypv1ohuy7.png)


Now if we open our dev tools and click _Add Button Press_ we will see that we are talking to our local firestore database

![web app screenshot 2](https://dev-to-uploads.s3.amazonaws.com/i/12m13hb9hl7j56oy5wgn.png)

Finally, lets clear all the documents by hitting _Delete All_

![web app screenshot 3](https://dev-to-uploads.s3.amazonaws.com/i/3494nr52hs18m0l08mav.png)





