using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace Lab.Cam.Library.RNLabCamLibrary
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNLabCamLibraryModule : NativeModuleBase
    {
        /// <summary>
        /// Instantiates the <see cref="RNLabCamLibraryModule"/>.
        /// </summary>
        internal RNLabCamLibraryModule()
        {

        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNLabCamLibrary";
            }
        }
    }
}
