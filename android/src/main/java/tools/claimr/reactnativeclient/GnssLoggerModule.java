package tools.claimr.reactnativeclient;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.GnssClock;
import android.location.GnssMeasurementsEvent;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class GnssLoggerModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    private static final String RAW_GNSS_FILE_HEADER_KEY = "RAW_GNSS_FILE_HEADER";

    private static final long LOCATION_RATE_GPS_MS = TimeUnit.SECONDS.toMillis(1L);

    private final LocationManager locationManager;
    private final LocationListener locationListener = new LocationListener() {
        @Override
        public void onLocationChanged(Location location) {
            sendMessage("locationChange", String.format("%s,%s", location.getLatitude(), location.getLongitude()));
        }

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {
        }

        @Override
        public void onProviderEnabled(String provider) {
        }

        @Override
        public void onProviderDisabled(String provider) {
        }
    };
    private GnssMeasurementsEvent.Callback gnssCallback;

    GnssLoggerModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
    }

    @NonNull
    @Override
    public String getName() {
        return "GnssLogger";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        constants.put(RAW_GNSS_FILE_HEADER_KEY, GnssLoggerUtil.gnssMeasurementsFileHeader());

        return constants;
    }

    @ReactMethod
    public void registerGnssMeasurementsCallback(Callback errorCallback, Callback successCallback) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            errorCallback.invoke(String.format("Unsupported Android version %s, requires at least %s", Build.VERSION.SDK_INT, Build.VERSION_CODES.N));
        } else {
            // Request permissions for accessing location details
            while (ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                Log.e("GnssLogger", "Requesting permissions");
                requestLocationPermission();
            }

            // Register the location listener
            Log.e("GnssLogger", "Registering Location Listener");
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, LOCATION_RATE_GPS_MS, 0.0f, locationListener);

            // Register the GNSS measurements logger
            Log.e("GnssLogger", "Registering GNSS Measurements Callback");
            gnssCallback = new GnssMeasurementsEvent.Callback() {
                @Override
                public void onGnssMeasurementsReceived(GnssMeasurementsEvent event) {
                    GnssClock gnssClock = event.getClock();
                    event.getMeasurements().forEach(gnssMeasurement -> {
                        sendMessage("gnssMeasurement", gnssMeasurement.toString());
                        sendMessage("rawGnssMeasurementLine", GnssLoggerUtil.gnssMeasurementToFileLine(gnssClock, gnssMeasurement));
                    });
                }

                @Override
                public void onStatusChanged(int status) {
                }
            };
            locationManager.registerGnssMeasurementsCallback(gnssCallback);

            // Notify our React Native application that we are now listening for GNSS and location updates.
            successCallback.invoke();
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    @ReactMethod
    public void unregisterGnssMeasurementsCallback() {
        if (gnssCallback != null) {
            locationManager.unregisterGnssMeasurementsCallback(gnssCallback);
            gnssCallback = null;
        }

        locationManager.removeUpdates(locationListener);
    }

    /**
     * Send a message as an event to our React Native application. The event will have one field
     * "message", which is a string containing {@param message}.
     *
     * @param eventName The name of the event our React Native application will be listening for.
     * @param message   The content of the message to be send.
     */
    private void sendMessage(String eventName, String message) {
        // Build the event object
        WritableMap params = Arguments.createMap();
        params.putString("message", message);

        // Emit the event
        getReactApplicationContext()
                .getJSModule(RCTNativeAppEventEmitter.class)
                .emit(eventName, params);
    }

    private void requestLocationPermission() {
        Log.d("GnssLogger", "Requesting location access");
        Toast.makeText(getReactApplicationContext(), "Requesting location access", Toast.LENGTH_LONG).show();

        if (reactContext.getCurrentActivity() == null) {
            Log.e("GnssLogger", "Activity is null");
            return;
        }
        ActivityCompat.requestPermissions(
                reactContext.getCurrentActivity(),
                new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                0
        );
    }

}
