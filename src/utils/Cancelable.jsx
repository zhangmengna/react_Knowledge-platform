/*给fetch封装可取消*/
' use strict'

export default function makeCancelable(promise){
   let hasCanceled_ = false;
   const wrappedPromise = new Promise((resolve, reject) => {
       promise.then((val) =>
           hasCanceled_ ? reject({isCanceled: true}) : resolve(val)
       );
       promise.catch((error) =>
           hasCanceled_ ? reject({isCanceled: true}) : reject(error)
       );
   });

   return {
       promise: wrappedPromise,
       cancel() {
           hasCanceled_ = true;
       },
   };
}

/*this.cancelable = makeCancelable(fetch('url')));
this.cancelable.promise
    .then((response)=>response.json())
    .then((responseData)=> {          
        console.log(responseData);                            
    }).catch((error)=> {
        console.log(error); 
    });
this.cancelable.cancel();*/