import pyshark

interface = 'Wi-Fi'  # or 'Ethernet', or use the ID from `tshark -D`

def print_sni(pkt):
    try:
        if hasattr(pkt, 'tls') and hasattr(pkt.tls, 'handshake_extensions_server_name'):
            sni = pkt.tls.handshake_extensions_server_name
            print(f"[SNI] {sni}")
    except Exception:
        pass

print(f"[*] Sniffing on interface: {interface}")
capture = pyshark.LiveCapture(interface=interface, display_filter='tls.handshake.type == 1')
capture.apply_on_packets(print_sni)
