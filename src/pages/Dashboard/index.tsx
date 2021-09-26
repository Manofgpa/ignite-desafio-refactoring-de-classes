import { useEffect, useState } from 'react'

import Header from '../../components/Header'
import api from '../../services/api'
import Food from '../../components/Food/index'
import ModalAddFood from '../../components/ModalAddFood'
import ModalEditFood from '../../components/ModalEditFood'
import { FoodsContainer } from './styles'
import { FoodType } from '../../types'

interface DashboardState {
  foods: Array<FoodType>
  editingFood: FoodType
  modalOpen: boolean
  editModalOpen: boolean
}

const Dashboard = (): JSX.Element => {
  const [state, setState] = useState<DashboardState>({
    foods: [],
    editingFood: {
      id: 0,
      name: '',
      available: false,
      description: '',
      image: '',
      price: '',
    },
    modalOpen: false,
    editModalOpen: false,
  })

  useEffect(() => {
    const loadFoods = async () => {
      const response = await api.get<FoodType[]>('/foods')
      const data = response.data
      setState({
        ...state,
        foods: data,
      })
    }
    loadFoods()
  }, [])

  const handleAddFood = async (food: FoodType) => {
    const { foods } = state

    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      })

      setState({
        ...state,
        foods: [...foods, response.data],
      })
    } catch (err) {
      console.log(err)
    }
  }

  const handleUpdateFood = async (food: FoodType) => {
    const { foods, editingFood } = state

    try {
      const foodUpdated = await api.put(`/foods/${editingFood.id}`, {
        ...editingFood,
        ...food,
      })

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data
      )

      setState({
        ...state,
        foods: foodsUpdated,
      })
    } catch (err) {
      console.log(err)
    }
  }

  const handleDeleteFood = async (id: number) => {
    const { foods } = state

    await api.delete(`/foods/${id}`)

    const foodsFiltered = foods.filter(food => food.id !== id)

    setState({
      ...state,
      foods: foodsFiltered,
    })
  }

  const toggleModal = () => {
    const { modalOpen } = state

    setState({ ...state, modalOpen: !modalOpen })
  }

  const toggleEditModal = () => {
    const { editModalOpen } = state

    setState({
      ...state,
      editModalOpen: !editModalOpen,
    })
  }

  const handleEditFood = (food: FoodType) => {
    setState({
      ...state,
      editingFood: food,
      editModalOpen: true,
    })
  }

  const { modalOpen, editModalOpen, editingFood, foods } = state

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid='foods-list'>
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  )
}

export default Dashboard
