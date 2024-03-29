import { useContext, useEffect, useRef, useState } from "react"
import "./index.css"
import { faEllipsis, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import AddCard from "../Card/AddCard"
import Card from "../Card/Card"
import { v4 as uuid } from "uuid"
import { StateContext } from "../Context/StateContext"
import { Container, Draggable } from "react-smooth-dnd"
import {
	archivedListById,
	deleteListById,
	renameListById,
} from "../../services/lists"

const List = (props) => {
	const { list, onCardDrop } = props
	const { lists, setLists, createCardRef } = useContext(StateContext)
	const renameListRef = useRef(null)
	const [newListName, setNewListName] = useState(list.listName)
	const [isOpenListActions, setIsOpenListActions] = useState(false)
	const [isOpenAddCard, setIsOpenAddCard] = useState(false)
	const [isOpenRenameList, setIsOpenRenameList] = useState(false)
	const listId = list._id

	useEffect(() => {
		if (isOpenRenameList) renameListRef.current.focus()
	}, [isOpenRenameList])

	const handleOpenRenameList = () => {
		setIsOpenRenameList(!isOpenRenameList)
	}

	const handleOpenAddCard = () => {
		setIsOpenAddCard(!isOpenAddCard)
	}

	const handleOpenListActions = () => {
		setIsOpenListActions(!isOpenListActions)
	}

	const handleEnter = (e) => {
		if (e.keyCode === 13) {
			e.target.blur()
		}
	}

	const handleBlurRenameList = async () => {
		const newLists = lists.map((list) => {
			if (list._id === listId) {
				return {
					...list,
					listName: newListName,
				}
			}
			return list
		})
		setLists(newLists)
		setIsOpenRenameList(!isOpenRenameList)
		await renameListById(listId, newListName)
	}

	const handleChangeRenameList = (e) => {
		const { value } = e.target
		setNewListName(value)
	}

	const handleDeleteList = async (listId) => {
		setLists((prevLists) => prevLists.filter((list) => list._id !== listId))
		await deleteListById(listId)
	}

	const handleArchivedList = async (listId) => {
		const newLists = lists.map((list) => {
			if (list._id === listId) {
				return {
					...list,
					isArchived: true,
				}
			}
			return list
		})
		console.log(newLists)
		setLists(newLists)
		await archivedListById(listId)
	}

	return (
		<div className="list">
			<h2
				className="list-title"
				onClick={handleOpenRenameList}
				style={{ display: isOpenRenameList ? "none" : "block" }}
			>
				{newListName}
			</h2>
			<input
				ref={renameListRef}
				className="rename-list"
				onChange={handleChangeRenameList}
				onBlur={handleBlurRenameList}
				onKeyUp={handleEnter}
				value={newListName}
				style={{ display: isOpenRenameList ? "block" : "none" }}
			/>

			<div className="cards">
				<Container
					groupName="col"
					onDrop={(dropResult) => onCardDrop(dropResult, list._id)}
					getChildPayload={(index) => list.cards[index]}
					dragClass="card-ghost"
					dropClass="card-ghost-drop"
					dropPlaceholder={{
						animationDuration: 150,
						showOnTop: true,
						className: "card-drop-preview",
					}}
					dropPlaceholderAnimationDuration={200}
				>
					{list?.cards?.map(
						(card) =>
							card.isArchived || (
								<Draggable key={card._Id}>
									<Card list={list} card={card} />
								</Draggable>
							)
					)}

					<div className="add-card">
						<div
							onClick={handleOpenAddCard}
							className="open-add-card"
							style={{ display: isOpenAddCard ? "none" : "flex" }}
						>
							<FontAwesomeIcon icon={faPlus} />
							<span>Add new card</span>
						</div>
						<AddCard
							key={uuid()}
							createCardRef={createCardRef}
							list={list}
							onClose={handleOpenAddCard}
							isOpenAddCard={isOpenAddCard}
							handleOpenAddCard={handleOpenAddCard}
						/>
					</div>
				</Container>
			</div>
			<span className="open-list-actions" onClick={handleOpenListActions}>
				<FontAwesomeIcon icon={faEllipsis} />
			</span>
			<div
				style={{ display: isOpenListActions ? "block" : "none" }}
				className="list-actions"
			>
				<span onClick={handleOpenListActions}>
					<FontAwesomeIcon icon={faXmark} />
				</span>
				<h3 className="list-actions-title">List actions</h3>
				<div className="vertical"></div>
				<div className="list-actions-detail">
					<span>Add card...</span>
					<span>Copy list...</span>
					<span>Move list...</span>
					<span>Watch</span>
					<div className="vertical"></div>
					<span>Sort by...</span>
					<span onClick={() => handleArchivedList(list._id)}>
						Archived this list
					</span>
					<div className="vertical"></div>
					<span onClick={() => handleDeleteList(list._id)}>
						Delete this list
					</span>
				</div>
			</div>
		</div>
	)
}

export default List
