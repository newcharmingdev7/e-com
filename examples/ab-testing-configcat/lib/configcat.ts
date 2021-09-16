import c from './config.json'

type Flags = typeof c.ConfigJSON.f

type Keys = keyof Flags

const flags: Flags = c.ConfigJSON[c.ConfigFile.FeatureFlags]

/**
 * Returns a value from the cached config, if the value has a target set it will
 * randomly pick one based on each target' percentage
 */
export function getValue<K extends Keys>(key: K): boolean {
  const setting = flags[key]
  const percentageItems = setting[c.Setting.RolloutPercentageItems]

  if (!percentageItems?.length) {
    return setting[c.Setting.Value]
  }

  let n = Math.random() * 100

  return (
    percentageItems.find((item) => {
      const target = item[c.RolloutPercentageItems.Percentage]
      if (target >= n) return true
      n -= target
    })?.[c.RolloutPercentageItems.Value] ?? setting[c.Setting.Value]
  )
}
