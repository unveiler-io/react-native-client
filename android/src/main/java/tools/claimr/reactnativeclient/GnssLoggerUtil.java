package tools.claimr.reactnativeclient;

import android.location.GnssClock;
import android.location.GnssMeasurement;
import android.os.Build;
import android.os.SystemClock;

import androidx.annotation.RequiresApi;

public class GnssLoggerUtil {

    private static final String COMMENT_START = "# ";
    private static final char LINE_END = '\n';
    private static final String VERSION_TAG = "Version: v2.0.0.1";

    static String gnssMeasurementsFileHeader() {
      return COMMENT_START + LINE_END +
        COMMENT_START + "Header Description:" + LINE_END +
        COMMENT_START + LINE_END +
        COMMENT_START + VERSION_TAG +
        String.format(" Platform: %s", Build.VERSION.RELEASE) +
        String.format(" Manufacturer: %s", Build.MANUFACTURER) +
        String.format(" Model: %s", Build.MODEL) +
        LINE_END +
        COMMENT_START + LINE_END +
        COMMENT_START +
        "Raw,ElapsedRealtimeMillis,TimeNanos,LeapSecond,TimeUncertaintyNanos,FullBiasNanos,"
        + "BiasNanos,BiasUncertaintyNanos,DriftNanosPerSecond,DriftUncertaintyNanosPerSecond,"
        + "HardwareClockDiscontinuityCount,Svid,TimeOffsetNanos,State,ReceivedSvTimeNanos,"
        + "ReceivedSvTimeUncertaintyNanos,Cn0DbHz,PseudorangeRateMetersPerSecond,"
        + "PseudorangeRateUncertaintyMetersPerSecond,"
        + "AccumulatedDeltaRangeState,AccumulatedDeltaRangeMeters,"
        + "AccumulatedDeltaRangeUncertaintyMeters,CarrierFrequencyHz,CarrierCycles,"
        + "CarrierPhase,CarrierPhaseUncertainty,MultipathIndicator,SnrInDb,"
        + "ConstellationType,AgcDb,CarrierFrequencyHz" +
        LINE_END +
        COMMENT_START + LINE_END;
    }

    /**
     * Create a GNSS Raw measurements line from the internal GNSS data representation objects.
     *
     * @param clock       The {@link GnssClock} of this measurement.
     * @param measurement The {@link GnssMeasurement} of this measurement.
     * @return A string formatted as a single line usable for RAW GNSS measurement files.
     */
    @RequiresApi(api = Build.VERSION_CODES.N)
    static String gnssMeasurementToFileLine(GnssClock clock, GnssMeasurement measurement) {
        return String.format(
                "Raw,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s",
                SystemClock.elapsedRealtime(),
                clock.getTimeNanos(),
                clock.hasLeapSecond() ? clock.getLeapSecond() : "",
                clock.hasTimeUncertaintyNanos() ? clock.getTimeUncertaintyNanos() : "",
                clock.getFullBiasNanos(),
                clock.hasBiasNanos() ? clock.getBiasNanos() : "",
                clock.hasBiasUncertaintyNanos() ? clock.getBiasUncertaintyNanos() : "",
                clock.hasDriftNanosPerSecond() ? clock.getDriftNanosPerSecond() : "",
                clock.hasDriftUncertaintyNanosPerSecond()
                        ? clock.getDriftUncertaintyNanosPerSecond()
                        : "",
                clock.getHardwareClockDiscontinuityCount(),
                measurement.getSvid(),
                measurement.getTimeOffsetNanos(),
                measurement.getState(),
                measurement.getReceivedSvTimeNanos(),
                measurement.getReceivedSvTimeUncertaintyNanos(),
                measurement.getCn0DbHz(),
                measurement.getPseudorangeRateMetersPerSecond(),
                measurement.getPseudorangeRateUncertaintyMetersPerSecond(),
                measurement.getAccumulatedDeltaRangeState(),
                measurement.getAccumulatedDeltaRangeMeters(),
                measurement.getAccumulatedDeltaRangeUncertaintyMeters(),
                measurement.hasCarrierFrequencyHz() ? measurement.getCarrierFrequencyHz() : "",
                measurement.hasCarrierCycles() ? measurement.getCarrierCycles() : "",
                measurement.hasCarrierPhase() ? measurement.getCarrierPhase() : "",
                measurement.hasCarrierPhaseUncertainty()
                        ? measurement.getCarrierPhaseUncertainty()
                        : "",
                measurement.getMultipathIndicator(),
                measurement.hasSnrInDb() ? measurement.getSnrInDb() : "",
                measurement.getConstellationType(),
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                        && measurement.hasAutomaticGainControlLevelDb()
                        ? measurement.getAutomaticGainControlLevelDb()
                        : "",
                measurement.hasCarrierFrequencyHz() ? measurement.getCarrierFrequencyHz() : "");
    }
}
