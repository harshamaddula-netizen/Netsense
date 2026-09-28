// ==============================================================================
// NETSENSE CAMPUS - LOCAL WI-FI INTERFACE TELEMETRY SERVICE
// ==============================================================================

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ConnectedWifiInfo {
  connected: boolean;
  ssid: string | null;
  bssid: string | null;
  signal_percent: number | null;
  signal_quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DISCONNECTED';
  band: string | null; // e.g. "5 GHz" or "2.4 GHz"
  channel: number | null;
  radio_type: string | null; // e.g. "802.11ax" (Wi-Fi 6)
  adapter_name: string | null;
  receive_rate_mbps: number | null;
  transmit_rate_mbps: number | null;
  rssi_dbm: number | null;
  timestamp: string;
  source: 'SYSTEM_HARDWARE_INTERFACE';
}

export interface AvailableNetwork {
  ssid: string;
  bssid: string | null;
  signal_percent: number;
  signal_quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  security_type: string; // e.g. "WPA2-Personal", "WPA3", "Open"
  encryption: string; // e.g. "CCMP"
  band: string | null; // e.g. "2.4 GHz", "5 GHz", "6 GHz"
  channel: number | null;
  radio_type: string | null; // e.g. "802.11ax", "802.11ac", "802.11n"
  network_type: string; // "Infrastructure" or "Ad-Hoc"
  is_connected: boolean;
}

export interface NetworkScanReport {
  connected_network: ConnectedWifiInfo | null;
  available_networks: AvailableNetwork[];
  scan_timestamp: string;
  networks_count: number;
  platform: {
    os: string;
    hardware_scan_supported: boolean;
    restriction_notice: string | null;
  };
}

export class WifiService {
  /**
   * Queries operating system wireless card interface directly (Windows netsh).
   * Safe and non-invasive: only reads adapter association state.
   */
  public async getConnectedWifi(): Promise<ConnectedWifiInfo> {
    const timestamp = new Date().toISOString();

    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('netsh wlan show interfaces', { timeout: 3500 });
        return this.parseWindowsNetsh(stdout, timestamp);
      } else if (process.platform === 'linux') {
        // Try nmcli or iwgetid on Linux
        try {
          const { stdout } = await execAsync('nmcli -t -f active,ssid,bssid,signal,freq,chan,security dev wifi', { timeout: 3500 });
          const lines = stdout.split('\n');
          const activeLine = lines.find((l) => l.startsWith('yes:'));
          if (activeLine) {
            const [, ssid, bssid, signalStr, freq, chan, security] = activeLine.split(':');
            const signal = parseInt(signalStr, 10) || 0;
            return {
              connected: true,
              ssid: ssid || null,
              bssid: bssid || null,
              signal_percent: signal,
              signal_quality: signal >= 80 ? 'EXCELLENT' : signal >= 60 ? 'GOOD' : signal >= 40 ? 'FAIR' : 'POOR',
              band: freq?.includes('5') ? '5 GHz' : '2.4 GHz',
              channel: parseInt(chan, 10) || null,
              radio_type: security || '802.11',
              adapter_name: 'Linux Wireless Interface',
              receive_rate_mbps: null,
              transmit_rate_mbps: null,
              rssi_dbm: null,
              timestamp,
              source: 'SYSTEM_HARDWARE_INTERFACE',
            };
          }
        } catch {
          // fall through
        }
      }
    } catch (err: any) {
      console.warn('System Wi-Fi query notice (hardware interface):', err.message);
    }

    // Honest disconnected state when no Wi-Fi interface is detected or query fails
    return {
      connected: false,
      ssid: null,
      bssid: null,
      signal_percent: 0,
      signal_quality: 'DISCONNECTED',
      band: null,
      channel: null,
      radio_type: null,
      adapter_name: 'No active Wi-Fi interface',
      receive_rate_mbps: 0,
      transmit_rate_mbps: 0,
      rssi_dbm: null,
      timestamp,
      source: 'SYSTEM_HARDWARE_INTERFACE',
    };
  }

  /**
   * Scans and returns all available Wi-Fi networks currently detected around the device.
   */
  public async getAvailableNetworks(): Promise<NetworkScanReport> {
    const timestamp = new Date().toISOString();
    const connectedInfo = await this.getConnectedWifi();

    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('netsh wlan show networks mode=bssid', { timeout: 6000 });
        const networks = this.parseWindowsNetworks(
          stdout,
          connectedInfo.bssid,
          connectedInfo.ssid,
          connectedInfo.connected
        );

        // If the connected network was not listed in beacon scan (e.g. hidden SSID), synthesize it from interface
        if (connectedInfo.connected && connectedInfo.ssid && !networks.some((n) => n.is_connected)) {
          networks.unshift({
            ssid: connectedInfo.ssid,
            bssid: connectedInfo.bssid,
            signal_percent: connectedInfo.signal_percent ?? 75,
            signal_quality: connectedInfo.signal_quality === 'DISCONNECTED' ? 'GOOD' : connectedInfo.signal_quality,
            security_type: 'WPA2/WPA3-Personal',
            encryption: 'CCMP',
            band: connectedInfo.band,
            channel: connectedInfo.channel,
            radio_type: connectedInfo.radio_type,
            network_type: 'Infrastructure',
            is_connected: true,
          });
        }

        return {
          connected_network: connectedInfo.connected ? connectedInfo : null,
          available_networks: networks,
          scan_timestamp: timestamp,
          networks_count: networks.length,
          platform: {
            os: 'Windows (netsh wlan native subsystem)',
            hardware_scan_supported: true,
            restriction_notice: null,
          },
        };
      } else if (process.platform === 'linux') {
        try {
          const { stdout } = await execAsync('nmcli -t -f active,ssid,bssid,signal,freq,chan,security dev wifi', { timeout: 6000 });
          const networks: AvailableNetwork[] = [];
          for (const line of stdout.split('\n')) {
            const parts = line.split(':');
            if (parts.length >= 7) {
              const [active, ssid, bssid, signalStr, freq, chan, security] = parts;
              const signal = parseInt(signalStr, 10) || 0;
              const isConn = active === 'yes' || (connectedInfo.ssid && connectedInfo.ssid === ssid);
              networks.push({
                ssid: ssid || '[Hidden Network]',
                bssid: bssid || null,
                signal_percent: signal,
                signal_quality: signal >= 80 ? 'EXCELLENT' : signal >= 60 ? 'GOOD' : signal >= 40 ? 'FAIR' : 'POOR',
                security_type: security || 'Open',
                encryption: 'Standard',
                band: freq?.includes('5') ? '5 GHz' : '2.4 GHz',
                channel: parseInt(chan, 10) || null,
                radio_type: '802.11',
                network_type: 'Infrastructure',
                is_connected: Boolean(isConn),
              });
            }
          }
          return {
            connected_network: connectedInfo.connected ? connectedInfo : null,
            available_networks: networks,
            scan_timestamp: timestamp,
            networks_count: networks.length,
            platform: {
              os: 'Linux (nmcli dev wifi subsystem)',
              hardware_scan_supported: true,
              restriction_notice: null,
            },
          };
        } catch {
          // fall through
        }
      }
    } catch (err: any) {
      console.warn('Network scan error:', err.message);
    }

    // Platform where OS hardware scanning is not permitted / unavailable
    return {
      connected_network: connectedInfo.connected ? connectedInfo : null,
      available_networks: connectedInfo.connected && connectedInfo.ssid
        ? [
            {
              ssid: connectedInfo.ssid,
              bssid: connectedInfo.bssid,
              signal_percent: connectedInfo.signal_percent ?? 80,
              signal_quality: connectedInfo.signal_quality === 'DISCONNECTED' ? 'GOOD' : connectedInfo.signal_quality,
              security_type: 'Authenticated Profile',
              encryption: 'CCMP',
              band: connectedInfo.band,
              channel: connectedInfo.channel,
              radio_type: connectedInfo.radio_type,
              network_type: 'Infrastructure',
              is_connected: true,
            },
          ]
        : [],
      scan_timestamp: timestamp,
      networks_count: connectedInfo.connected ? 1 : 0,
      platform: {
        os: process.platform,
        hardware_scan_supported: false,
        restriction_notice:
          'Raw Wi-Fi beacon scanning is restricted by the current operating environment or requires elevated host permissions. Displaying active network link.',
      },
    };
  }

  private parseWindowsNetworks(
    stdout: string,
    connectedBssid: string | null,
    connectedSsid: string | null,
    isConnected: boolean
  ): AvailableNetwork[] {
    const networks: AvailableNetwork[] = [];
    const lines = stdout.split(/\r?\n/);
    let currentSsid = '';
    let networkType = 'Infrastructure';
    let authentication = 'Unknown';
    let encryption = 'None';
    let currentBssid: string | null = null;
    let signal = 0;
    let radioType = '';
    let band = '';
    let channel: number | null = null;

    const pushBssid = () => {
      if (currentBssid && currentSsid) {
        let quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'GOOD';
        if (signal >= 80) quality = 'EXCELLENT';
        else if (signal >= 60) quality = 'GOOD';
        else if (signal >= 40) quality = 'FAIR';
        else quality = 'POOR';

        const isConn =
          isConnected &&
          ((connectedBssid && connectedBssid.toLowerCase() === currentBssid.toLowerCase()) ||
            (connectedSsid && connectedSsid.toLowerCase() === currentSsid.toLowerCase()));

        networks.push({
          ssid: currentSsid,
          bssid: currentBssid,
          signal_percent: signal,
          signal_quality: quality,
          security_type: authentication,
          encryption,
          band: band || (radioType.includes('ax') ? '5 GHz' : '2.4 GHz'),
          channel,
          radio_type: radioType,
          network_type: networkType,
          is_connected: Boolean(isConn),
        });
        currentBssid = null;
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const ssidMatch = trimmed.match(/^SSID\s+\d+\s*:\s*(.*)$/i);
      if (ssidMatch) {
        pushBssid();
        currentSsid = ssidMatch[1].trim() || '[Hidden Network]';
        networkType = 'Infrastructure';
        authentication = 'Unknown';
        encryption = 'None';
        continue;
      }

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;
      const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
      const val = trimmed.slice(colonIdx + 1).trim();

      if (key === 'network type') networkType = val;
      else if (key === 'authentication') authentication = val;
      else if (key === 'encryption') encryption = val;
      else if (key.startsWith('bssid')) {
        pushBssid();
        currentBssid = val;
      } else if (key === 'signal') {
        signal = parseInt(val.replace('%', ''), 10) || 0;
      } else if (key === 'radio type') {
        radioType = val;
      } else if (key === 'band') {
        band = val;
      } else if (key === 'channel') {
        channel = parseInt(val, 10) || null;
      }
    }
    pushBssid();

    // Sort networks: connected first, then by signal strength descending
    networks.sort((a, b) => {
      if (a.is_connected && !b.is_connected) return -1;
      if (!a.is_connected && b.is_connected) return 1;
      return b.signal_percent - a.signal_percent;
    });

    return networks;
  }

  private parseWindowsNetsh(stdout: string, timestamp: string): ConnectedWifiInfo {
    const lines = stdout.split('\r\n').map((l) => l.trim());
    const dict: Record<string, string> = {};

    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().toLowerCase();
        const val = parts.slice(1).join(':').trim();
        dict[key] = val;
      }
    }

    const state = dict['state'] || '';
    const isConnected = state.toLowerCase().includes('connected');

    if (!isConnected) {
      return {
        connected: false,
        ssid: null,
        bssid: null,
        signal_percent: 0,
        signal_quality: 'DISCONNECTED',
        band: null,
        channel: null,
        radio_type: null,
        adapter_name: dict['description'] || 'Wireless Adapter',
        receive_rate_mbps: 0,
        transmit_rate_mbps: 0,
        rssi_dbm: null,
        timestamp,
        source: 'SYSTEM_HARDWARE_INTERFACE',
      };
    }

    const ssid = dict['ssid'] || null;
    const bssid = dict['ap bssid'] || dict['bssid'] || null;
    const band = dict['band'] || (dict['radio type']?.includes('ax') ? '5 GHz' : '2.4 GHz');
    const channel = dict['channel'] ? parseInt(dict['channel'], 10) : null;
    const radioType = dict['radio type'] || null;
    const adapterName = dict['description'] || null;

    const signalRaw = dict['signal'] || '0%';
    const signalPercent = parseInt(signalRaw.replace('%', ''), 10) || 0;

    const rxRate = dict['receive rate (mbps)'] ? parseFloat(dict['receive rate (mbps)']) : null;
    const txRate = dict['transmit rate (mbps)'] ? parseFloat(dict['transmit rate (mbps)']) : null;
    const rssi = dict['rssi'] ? parseInt(dict['rssi'], 10) : null;

    let signalQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DISCONNECTED' = 'GOOD';
    if (signalPercent >= 80) signalQuality = 'EXCELLENT';
    else if (signalPercent >= 60) signalQuality = 'GOOD';
    else if (signalPercent >= 40) signalQuality = 'FAIR';
    else signalQuality = 'POOR';

    return {
      connected: true,
      ssid,
      bssid,
      signal_percent: signalPercent,
      signal_quality: signalQuality,
      band,
      channel,
      radio_type: radioType,
      adapter_name: adapterName,
      receive_rate_mbps: rxRate,
      transmit_rate_mbps: txRate,
      rssi_dbm: rssi,
      timestamp,
      source: 'SYSTEM_HARDWARE_INTERFACE',
    };
  }
}

export const wifiService = new WifiService();
