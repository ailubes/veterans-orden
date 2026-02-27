import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextValue {
  showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextValue>({
  showAlert: () => {},
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<AlertOptions>({ title: '' });

  const showAlert = useCallback((options: AlertOptions) => {
    setOpts(options);
    setVisible(true);
  }, []);

  const handlePress = (btn: AlertButton) => {
    setVisible(false);
    btn.onPress?.();
  };

  const buttons = opts.buttons?.length ? opts.buttons : [{ text: 'OK', style: 'default' as const }];

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.title}>{opts.title}</Text>
            {opts.message ? (
              <Text style={styles.message}>{opts.message}</Text>
            ) : null}
            <View style={[styles.buttons, buttons.length > 2 && styles.buttonsColumn]}>
              {buttons.map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.7}
                  onPress={() => handlePress(btn)}
                  style={[
                    styles.btn,
                    buttons.length <= 2 && styles.btnRow,
                    btn.style === 'destructive' && styles.btnDestructive,
                    btn.style === 'cancel' && styles.btnCancel,
                    btn.style !== 'cancel' && btn.style !== 'destructive' && styles.btnDefault,
                  ]}
                >
                  <Text style={[
                    styles.btnText,
                    btn.style === 'destructive' && styles.btnTextDestructive,
                    btn.style === 'cancel' && styles.btnTextCancel,
                    btn.style !== 'cancel' && btn.style !== 'destructive' && styles.btnTextDefault,
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: '#141618',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a1d20',
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    color: '#e7e7e7',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#8b8f96',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonsColumn: {
    flexDirection: 'column',
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  btnRow: {
    flex: 1,
  },
  btnDefault: {
    backgroundColor: '#b5793a',
  },
  btnCancel: {
    backgroundColor: '#1a1d20',
    borderWidth: 1,
    borderColor: '#2a2d30',
  },
  btnDestructive: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  btnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  btnTextDefault: {
    color: '#0f1011',
  },
  btnTextCancel: {
    color: '#8b8f96',
  },
  btnTextDestructive: {
    color: '#ef4444',
  },
});
